import PhysicalRequest from "../models/PhysicalRequest.js";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import { ApiError } from "../utils/ApiError.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { APPROVAL_MODE } from "../constants/approvalMode.js";
import { COPY_STATUS } from "../constants/copyStatus.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";
import { COLLECTION_GRACE_DAYS } from "../constants/requestPolicy.js";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPES,
} from "../constants/notificationTypes.js";
import * as librarySettingsService from "./librarySettingsService.js";
import * as autoApprovalService from "./autoApprovalService.js";
import * as notificationService from "./notificationService.js";
import * as bookCopyService from "./bookCopyService.js";

const STUDENT_POPULATE = {
  path: "student",
  select: "name email role notificationPreferences",
};

const BOOK_POPULATE = {
  path: "book",
  select: "title isbn coverImage physicalCopiesTotal physicalCopiesAvailable",
};

const DECIDER_POPULATE = {
  path: "decidedBy",
  select: "name email",
};

const REQUEST_POPULATE = [STUDENT_POPULATE, BOOK_POPULATE, DECIDER_POPULATE];

const notifyRequestApproved = async (request) => {
  const populated = await request.populate(REQUEST_POPULATE);

  await notificationService.notify({
    user: populated.student,
    category: NOTIFICATION_CATEGORIES.CIRCULATION,
    type: NOTIFICATION_TYPES.REQUEST_APPROVED,
    title: "Your request was approved",
    message: `Your request for "${populated.book.title}" was approved. Collect it by the agreed date.`,
    link: `/me/requests/${populated._id}`,
    relatedEntity: {
      kind: "PhysicalRequest",
      id: populated._id,
    },
  });

  return populated;
};

const assertBookExists = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");
  return book;
};

// M3 — lazy expiry. Every read path below calls this first: any
// "approved" request whose collection window (requestedCollectionDate +
// COLLECTION_GRACE_DAYS) has already passed without ever being collected
// flips to "expired" in a single bulk update. $expr + $add lets Mongo
// compare a computed per-document deadline against "now" without pulling
// documents into application code first. M1 (Phase 7) added a real
// cron scheduler to this app, but this path is deliberately left as
// lazy on-read rather than migrated to a scheduled sweep — a separate
// follow-up, not part of M2.
export const expireStaleApprovals = async () => {
  const graceMs = COLLECTION_GRACE_DAYS * 24 * 60 * 60 * 1000;
  const cutoffFilter = {
    status: REQUEST_STATUS.APPROVED,
    $expr: {
      $lt: [{ $add: ["$requestedCollectionDate", graceMs] }, new Date()],
    },
  };

  // M2 (Phase 7) — a request created via waitlistService.claimWaitlistEntry
  // holds a specific reservedCopy. A bulk updateMany can flip every
  // matching request's status in one round trip, but it can't also
  // release each one's copy back to AVAILABLE — that has to happen
  // per-document, and has to happen first, since releasing the copy is
  // what cascades to the next waiter (see bookCopyService.updateCopy's
  // promotion hook).
  const staleClaimed = await PhysicalRequest.find({
    ...cutoffFilter,
    reservedCopy: { $ne: null },
  }).select("reservedCopy");

  await Promise.all(
    staleClaimed.map((request) =>
      bookCopyService.updateCopy(request.reservedCopy, {
        status: COPY_STATUS.AVAILABLE,
      }),
    ),
  );

  await PhysicalRequest.updateMany(cutoffFilter, {
    $set: { status: REQUEST_STATUS.EXPIRED },
  });
};

// Windows overlap when one starts before the other ends, in both
// directions — the standard interval-overlap check, used both to guard
// against a student double-submitting for the same book and to build
// the "what else is already promised for this window" context a
// librarian needs to make a manual decision.
//
// M4 fix: a "collected" request only still represents a real conflict
// while its loan is still active. Before M4, nothing could ever return a
// loan, so every "collected" request's loan was necessarily active and
// this distinction was invisible — M4's return flow makes it a real bug
// if left unfixed: a book returned weeks ago would still block every
// future overlapping request forever, because the *request* itself
// never changes out of "collected" even after the *loan* is returned.
const findOverlappingRequests = async (
  bookId,
  collectionDate,
  returnDate,
  { statuses, excludeId } = {},
) => {
  const requests = await PhysicalRequest.find({
    book: bookId,
    ...(excludeId && { _id: { $ne: excludeId } }),
    status: { $in: statuses },
    requestedCollectionDate: { $lte: returnDate },
    requestedReturnDate: { $gte: collectionDate },
  })
    .populate(STUDENT_POPULATE)
    .lean();

  if (!statuses.includes(REQUEST_STATUS.COLLECTED)) return requests;

  const collectedIds = requests
    .filter((r) => r.status === REQUEST_STATUS.COLLECTED)
    .map((r) => r._id);
  if (collectedIds.length === 0) return requests;

  const activeLoanRequestIds = await Loan.find({
    request: { $in: collectedIds },
    status: LOAN_STATUS.ACTIVE,
  }).distinct("request");
  const stillActive = new Set(activeLoanRequestIds.map(String));

  return requests.filter(
    (r) =>
      r.status !== REQUEST_STATUS.COLLECTED ||
      stillActive.has(r._id.toString()),
  );
};

export const createRequest = async (studentId, payload) => {
  const {
    book: bookId,
    requestedCollectionDate,
    requestedReturnDate,
    studentNote,
  } = payload;

  await expireStaleApprovals();

  const book = await assertBookExists(bookId);

  if (book.physicalCopiesTotal < 1) {
    throw new ApiError(
      400,
      "This book has no physical copies configured for request",
    );
  }

  const duplicate = await findOverlappingRequests(
    bookId,
    requestedCollectionDate,
    requestedReturnDate,
    {
      statuses: [
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.APPROVED,
        REQUEST_STATUS.COLLECTED,
      ],
    },
  );

  const ownDuplicate = duplicate.find(
    (r) => r.student._id.toString() === studentId.toString(),
  );

  if (ownDuplicate) {
    throw new ApiError(
      409,
      "You already have a request for this book (pending, approved, or collected) covering an overlapping period",
    );
  }

  const request = await PhysicalRequest.create({
    student: studentId,
    book: bookId,
    requestedCollectionDate,
    requestedReturnDate,
    studentNote,
  });

  // M5 — automatic approval.
  // The engine only auto-approves when it can prove the request is safe.
  // Otherwise the request remains pending with an explanatory note.
  const settings = await librarySettingsService.getSettings();

  if (settings.approvalMode === APPROVAL_MODE.AUTOMATIC) {
    const result = await autoApprovalService.evaluateAutoApproval(
      bookId,
      requestedCollectionDate,
      requestedReturnDate,
      settings.autoApprovalBufferDays,
    );

    if (result.approved) {
      request.status = REQUEST_STATUS.APPROVED;
      request.autoApproved = true;
      request.decidedAt = new Date();
      request.decisionReason = result.reason;

      await request.save();

      // Automatic approval must notify the student exactly like
      // manual librarian approval.
      return notifyRequestApproved(request);
    }

    request.autoApprovalNote = result.reason;
    await request.save();
  }

  return request.populate(REQUEST_POPULATE);
};

const getStudentHistorySummary = async (studentId) => {
  const counts = await PhysicalRequest.aggregate([
    { $match: { student: studentId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const byStatus = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return {
    pending: byStatus.pending || 0,
    approved: byStatus.approved || 0,
    rejected: byStatus.rejected || 0,
    cancelled: byStatus.cancelled || 0,
    collected: byStatus.collected || 0,
    expired: byStatus.expired || 0,
  };
};

// Builds the manual-review context a librarian needs to make a real
// decision: who else is asking for/holding a promise on this book
// during an overlapping window, and how this student has behaved on
// past requests. "Conflicts" counts both APPROVED and COLLECTED
// requests — a collected request means the book is definitely
// physically out, which is if anything a stronger conflict signal than
// a mere approval. There's still no way to see an *active loan* that
// didn't originate from a request tracked by this app (not applicable
// here, since M3 has no other loan-creation path) — this is the honest
// limit of what M2/M3 can see, not an oversight.
const attachReviewContext = async (request) => {
  const [overlapping, studentHistory] = await Promise.all([
    findOverlappingRequests(
      request.book._id,
      request.requestedCollectionDate,
      request.requestedReturnDate,
      {
        statuses: [REQUEST_STATUS.APPROVED, REQUEST_STATUS.COLLECTED],
        excludeId: request._id,
      },
    ),
    getStudentHistorySummary(request.student._id),
  ]);

  return {
    ...request,
    conflictContext: {
      overlappingApprovedCount: overlapping.length,
      overlappingApprovedRequests: overlapping.map((r) => ({
        _id: r._id,
        student: r.student,
        status: r.status,
        requestedCollectionDate: r.requestedCollectionDate,
        requestedReturnDate: r.requestedReturnDate,
      })),
    },
    studentHistory,
  };
};

export const listRequestsForLibrarian = async (query) => {
  await expireStaleApprovals();

  const { status, book } = query;
  const { page, limit, skip } = getPaginationParams(query);

  const filter = { ...(status && { status }), ...(book && { book }) };

  const [requests, totalItems] = await Promise.all([
    PhysicalRequest.find(filter)
      .populate(REQUEST_POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PhysicalRequest.countDocuments(filter),
  ]);

  const enriched = await Promise.all(requests.map(attachReviewContext));

  return {
    requests: enriched,
    pagination: buildPaginationMeta({ page, limit, totalItems }),
  };
};

export const listRequestsForStudent = async (studentId, { status } = {}) => {
  await expireStaleApprovals();

  return PhysicalRequest.find({ student: studentId, ...(status && { status }) })
    .populate(REQUEST_POPULATE)
    .sort({ createdAt: -1 })
    .lean();
};

const assertRequestExists = async (requestId) => {
  const request =
    await PhysicalRequest.findById(requestId).populate(REQUEST_POPULATE);
  if (!request) throw new ApiError(404, "Request not found");
  return request;
};

export const getRequestById = async (requestId, requester) => {
  await expireStaleApprovals();

  const request = await assertRequestExists(requestId);

  const isOwner = request.student._id.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this request");
  }

  const plain = request.toObject();
  return requester.role === "librarian" ? attachReviewContext(plain) : plain;
};

export const approveRequest = async (requestId, librarian, note) => {
  const request = await assertRequestExists(requestId);

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new ApiError(
      409,
      `Cannot approve a request that is already ${request.status}`,
    );
  }

  request.status = REQUEST_STATUS.APPROVED;
  request.decidedBy = librarian._id;
  request.decidedAt = new Date();
  request.decisionReason = note || "";

  await request.save();

  return notifyRequestApproved(request);
};

export const rejectRequest = async (requestId, librarian, reason) => {
  const request = await assertRequestExists(requestId);
  if (request.status !== REQUEST_STATUS.PENDING) {
    throw new ApiError(
      409,
      `Cannot reject a request that is already ${request.status}`,
    );
  }

  request.status = REQUEST_STATUS.REJECTED;
  request.decidedBy = librarian._id;
  request.decidedAt = new Date();
  request.decisionReason = reason;
  await request.save();

  const populated = await request.populate(REQUEST_POPULATE);

  await notificationService.notify({
    user: populated.student,
    category: NOTIFICATION_CATEGORIES.CIRCULATION,
    type: NOTIFICATION_TYPES.REQUEST_REJECTED,
    title: "Your request was rejected",
    message: `Your request for "${populated.book.title}" was rejected${reason ? `: ${reason}` : "."}`,
    link: `/me/requests/${populated._id}`,
    relatedEntity: { kind: "PhysicalRequest", id: populated._id },
  });

  return populated;
};

export const cancelRequest = async (requestId, studentId) => {
  const request = await assertRequestExists(requestId);

  if (request.student._id.toString() !== studentId.toString()) {
    throw new ApiError(403, "You can only cancel your own request");
  }
  if (
    ![REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED].includes(request.status)
  ) {
    throw new ApiError(
      409,
      `Cannot cancel a request that is already ${request.status}`,
    );
  }

  request.status = REQUEST_STATUS.CANCELLED;
  await request.save();

  // M2 (Phase 7) — a waitlist-claimed request holds a copy specifically
  // reserved for this student. Cancelling it has to release that copy
  // back, or it stays stuck in `reserved` forever, invisible and
  // unborrowable by anyone.
  if (request.reservedCopy) {
    await bookCopyService.updateCopy(request.reservedCopy, {
      status: COPY_STATUS.AVAILABLE,
    });
  }

  return request.populate(REQUEST_POPULATE);
};
