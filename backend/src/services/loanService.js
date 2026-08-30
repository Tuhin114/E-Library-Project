import Loan from "../models/Loan.js";
import PhysicalRequest from "../models/PhysicalRequest.js";
import BookCopy from "../models/BookCopy.js";
import { ApiError } from "../utils/ApiError.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { COPY_STATUS, COPY_CONDITION } from "../constants/copyStatus.js";
import { FEE_TYPE } from "../constants/feeType.js";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPES,
} from "../constants/notificationTypes.js";
import * as bookCopyService from "./bookCopyService.js";
import * as feeService from "./feeService.js";
import * as librarySettingsService from "./librarySettingsService.js";
import * as waitlistService from "./waitlistService.js";
import * as notificationService from "./notificationService.js";
import { expireStaleApprovals } from "./physicalRequestService.js";

const LOAN_POPULATE = [
  { path: "student", select: "name email" },
  { path: "book", select: "title isbn coverImage" },
  { path: "copy", select: "copyNumber condition" },
  { path: "returnProcessedBy", select: "name email" },
];

// isOverdue/daysOverdue are deliberately computed at read time, not
// stored — a loan is overdue the instant "now" passes its dueDate, with
// no event required to make that true. Storing it would mean either a
// background job to flip it or a stale value between reads; computing
// it fresh avoids both.
const attachComputed = (loan) => {
  const isOverdue =
    loan.status === LOAN_STATUS.ACTIVE && new Date(loan.dueDate) < new Date();
  const daysOverdue = isOverdue
    ? Math.ceil((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24))
    : 0;
  return { ...loan, isOverdue, daysOverdue };
};

export const collectRequest = async (requestId, copyId) => {
  // A request that should have expired by now can't be collected, even
  // if nobody has viewed the request list since it lapsed — this check
  // has to run here too, not just on reads, or a stale approval could
  // still be "collected" after its grace window closed.
  await expireStaleApprovals();

  const request = await PhysicalRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.status !== REQUEST_STATUS.APPROVED) {
    throw new ApiError(
      409,
      `Cannot collect a request that is ${request.status}, not approved`,
    );
  }

  const now = new Date();

  if (now < request.requestedCollectionDate) {
    throw new ApiError(
      409,
      "Cannot collect a request before its requested collection date",
    );
  }

  let copy;
  if (request.reservedCopy) {
    // M2 (Phase 7) — this request came from a waitlist claim: the copy
    // was already reserved for this exact student, so it's honored
    // over any copyId the librarian might pass and over the usual
    // "find any available copy" fallback. A RESERVED-but-not-for-this-
    // request copy is never picked up by this path, since it's found
    // by id from the request itself, not by status query.
    copy = await BookCopy.findById(request.reservedCopy);
    if (!copy)
      throw new ApiError(
        404,
        "The copy reserved for this request no longer exists",
      );
    if (copy.status !== COPY_STATUS.RESERVED) {
      throw new ApiError(
        409,
        "The copy reserved for this request is no longer reserved",
      );
    }
  } else if (copyId) {
    copy = await BookCopy.findById(copyId);
    if (!copy) throw new ApiError(404, "Copy not found");
    if (copy.book.toString() !== request.book.toString()) {
      throw new ApiError(
        400,
        "This copy does not belong to the requested book",
      );
    }
    if (copy.status !== COPY_STATUS.AVAILABLE) {
      throw new ApiError(409, "This copy is not currently available");
    }
  } else {
    copy = await bookCopyService.findAvailableCopyForBook(request.book);
    if (!copy) {
      throw new ApiError(
        409,
        "No physical copy is currently available for this book",
      );
    }
  }

  // Reuses the same status-update path the librarian-facing inventory
  // endpoints use (M1) — issuing a copy is just a status change plus the
  // usual Book.physicalCopiesAvailable recalculation, nothing collection
  // -specific about that half of the operation.
  await bookCopyService.updateCopy(copy._id, { status: COPY_STATUS.ISSUED });

  const loan = await Loan.create({
    request: request._id,
    student: request.student,
    book: request.book,
    copy: copy._id,
    collectedAt: new Date(),
    dueDate: request.requestedReturnDate,
  });

  request.status = REQUEST_STATUS.COLLECTED;
  await request.save();

  const populated = await loan.populate(LOAN_POPULATE);
  return attachComputed(populated.toObject());
};

// M2 (Phase 7) — pure eligibility check, shared between the read paths
// (so the frontend can grey out/explain a disabled Renew button before
// the user even tries) and renewLoan itself (which re-derives this
// fresh at mutation time rather than trusting whatever eligibility was
// last read — see renewLoan for why).
const computeRenewalEligibility = (loan, { settings, booksWithWaitlist }) => {
  if (loan.status !== LOAN_STATUS.ACTIVE) {
    return { canRenew: false, reason: "This loan is not active." };
  }
  if (loan.isOverdue) {
    return {
      canRenew: false,
      reason: "This loan is overdue — return or settle it before renewing.",
    };
  }
  // Waitlist check ahead of maxRenewals — when both are true, "someone
  // is waiting" is the more actionable/urgent reason to surface than
  // "you've used your renewals up", and it's also the one the M2
  // Postman regression suite asserts on for this exact overlap case.
  if (booksWithWaitlist.has(loan.book._id.toString())) {
    return {
      canRenew: false,
      reason: "Another reader is waiting for this book.",
    };
  }
  if (loan.renewalCount >= settings.maxRenewals) {
    return {
      canRenew: false,
      reason: `Already renewed the maximum of ${settings.maxRenewals} time${settings.maxRenewals === 1 ? "" : "s"}.`,
    };
  }
  return { canRenew: true, reason: null };
};

export const listLoansForStudent = async (studentId, { status } = {}) => {
  const loans = await Loan.find({
    student: studentId,
    ...(status && { status }),
  })
    .populate(LOAN_POPULATE)
    .sort({ collectedAt: -1 })
    .lean();

  const computed = loans.map(attachComputed);

  const activeLoans = computed.filter(
    (loan) => loan.status === LOAN_STATUS.ACTIVE,
  );
  if (activeLoans.length === 0) return computed;

  const [settings, booksWithWaitlist] = await Promise.all([
    librarySettingsService.getSettings(),
    waitlistService.getBookIdsWithActiveWaitlist(
      activeLoans.map((loan) => loan.book._id),
    ),
  ]);

  return computed.map((loan) =>
    loan.status === LOAN_STATUS.ACTIVE
      ? {
          ...loan,
          renewalEligibility: computeRenewalEligibility(loan, {
            settings,
            booksWithWaitlist,
          }),
        }
      : loan,
  );
};

// overdueOnly implies status=active (an already-returned loan can never
// be "overdue"), and sorts oldest-due-first — the most overdue loans are
// what a librarian scanning this list actually needs to see first.
export const listLoansForLibrarian = async ({ status, overdueOnly } = {}) => {
  const filter = { ...(status && { status }) };
  if (overdueOnly) {
    filter.status = LOAN_STATUS.ACTIVE;
    filter.dueDate = { $lt: new Date() };
  }

  const loans = await Loan.find(filter)
    .populate(LOAN_POPULATE)
    .sort(overdueOnly ? { dueDate: 1 } : { collectedAt: -1 })
    .lean();

  return loans.map(attachComputed);
};

export const getLoanById = async (loanId, requester) => {
  const loan = await Loan.findById(loanId).populate(LOAN_POPULATE).lean();
  if (!loan) throw new ApiError(404, "Loan not found");

  const isOwner = loan.student._id.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this loan");
  }

  const computed = attachComputed(loan);
  if (computed.status !== LOAN_STATUS.ACTIVE) return computed;

  const [settings, hasWaitlist] = await Promise.all([
    librarySettingsService.getSettings(),
    waitlistService.hasActiveWaitlist(computed.book._id),
  ]);
  const booksWithWaitlist = new Set(
    hasWaitlist ? [computed.book._id.toString()] : [],
  );

  return {
    ...computed,
    renewalEligibility: computeRenewalEligibility(computed, {
      settings,
      booksWithWaitlist,
    }),
  };
};

// M4 — the return step. A copy returned in "poor" condition doesn't go
// straight back into circulation: it's flagged damaged so a librarian
// has to look at it before anyone else can borrow it. A late fee is
// created here if the return was overdue (see feeService.createFeeFor
// LateReturn); M3 (Phase 7) adds a second, independent fee if the copy
// came back damaged (see feeService.createFeeForDamageOrLoss) — a
// single return can now produce both at once, since they're separate
// charges for separate things.
export const returnLoan = async (loanId, librarian, { condition, notes }) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");
  if (loan.status !== LOAN_STATUS.ACTIVE) {
    throw new ApiError(
      409,
      `Cannot return a loan that is already ${loan.status}`,
    );
  }

  const now = new Date();
  const isLate = now > loan.dueDate;
  const daysLate = isLate
    ? Math.ceil((now - loan.dueDate) / (1000 * 60 * 60 * 24))
    : 0;

  loan.status = LOAN_STATUS.RETURNED;
  loan.returnedAt = now;
  loan.returnCondition = condition;
  loan.returnProcessedBy = librarian._id;
  await loan.save();

  const isDamaged = condition === COPY_CONDITION.POOR;
  const nextCopyStatus = isDamaged
    ? COPY_STATUS.DAMAGED
    : COPY_STATUS.AVAILABLE;
  await bookCopyService.updateCopy(loan.copy, {
    status: nextCopyStatus,
    condition,
    ...(notes && { notes }),
  });

  let fee = null;
  if (daysLate > 0) {
    fee = await feeService.createFeeForLateReturn({
      loanId: loan._id,
      studentId: loan.student,
      bookId: loan.book,
      daysLate,
    });
  }

  let damageFee = null;
  if (isDamaged) {
    damageFee = await feeService.createFeeForDamageOrLoss({
      loanId: loan._id,
      studentId: loan.student,
      bookId: loan.book,
      type: FEE_TYPE.DAMAGE,
    });
  }

  const populated = await loan.populate(LOAN_POPULATE);
  return { loan: attachComputed(populated.toObject()), fee, damageFee };
};

// M3 (Phase 7) — a librarian declares an active loan's copy lost. Closes
// out the loan (it was never returned, so RETURNED would be misleading;
// LOST is its own terminal status), marks the copy LOST, and generates a
// PENDING_REVIEW replacement-cost fee the same way a damaged return does
// — the student isn't charged or notified until a librarian finalizes
// it. Deliberately doesn't also compute a late fee even if the loan was
// already overdue when reported lost — one fee for one book, kept
// simple; flagged as a deliberate scope decision, not an oversight.
export const reportLoanLost = async (loanId, librarian, { notes } = {}) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");
  if (loan.status !== LOAN_STATUS.ACTIVE) {
    throw new ApiError(
      409,
      `Cannot report a loan lost that is already ${loan.status}`,
    );
  }

  loan.status = LOAN_STATUS.LOST;
  loan.lostReportedAt = new Date();
  loan.lostReportedBy = librarian._id;
  await loan.save();

  await bookCopyService.updateCopy(loan.copy, {
    status: COPY_STATUS.LOST,
    ...(notes && { notes }),
  });

  const fee = await feeService.createFeeForDamageOrLoss({
    loanId: loan._id,
    studentId: loan.student,
    bookId: loan.book,
    type: FEE_TYPE.LOST,
  });

  const populated = await loan.populate(LOAN_POPULATE);
  return { loan: attachComputed(populated.toObject()), fee };
};

// M2 (Phase 7) — extends dueDate by LibrarySettings.renewalExtensionDays,
// bounded by maxRenewals and blocked outright if the loan is overdue or
// if anyone is actively waiting for this book. Every rejection reason
// mirrors computeRenewalEligibility exactly, but is re-derived fresh
// here rather than trusting a previously-read renewalEligibility —
// time has necessarily passed since that was computed (the loan could
// have gone overdue, or someone could have joined the waitlist, in the
// interim), so the mutation itself must never rely on stale eligibility.
export const renewLoan = async (loanId, requester) => {
  const loan = await Loan.findById(loanId).populate(LOAN_POPULATE);
  if (!loan) throw new ApiError(404, "Loan not found");

  const isOwner = loan.student._id.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this loan");
  }

  if (loan.status !== LOAN_STATUS.ACTIVE) {
    throw new ApiError(409, `Cannot renew a loan that is ${loan.status}`);
  }

  const now = new Date();
  if (now > loan.dueDate) {
    throw new ApiError(
      409,
      "This loan is overdue — return or settle it before renewing",
    );
  }

  const settings = await librarySettingsService.getSettings();

  // Same waitlist-before-maxRenewals priority as computeRenewalEligibility.
  const hasWaitlist = await waitlistService.hasActiveWaitlist(loan.book._id);
  if (hasWaitlist) {
    throw new ApiError(
      409,
      "Another reader is waiting for this book — it can't be renewed",
    );
  }

  if (loan.renewalCount >= settings.maxRenewals) {
    throw new ApiError(
      409,
      `This loan has already been renewed the maximum number of times (${settings.maxRenewals})`,
    );
  }

  const previousDueDate = loan.dueDate;
  const newDueDate = new Date(
    loan.dueDate.getTime() +
      settings.renewalExtensionDays * 24 * 60 * 60 * 1000,
  );

  loan.dueDate = newDueDate;
  loan.renewalCount += 1;
  loan.renewalHistory.push({ previousDueDate, newDueDate, renewedAt: now });
  await loan.save();

  await notificationService.notify({
    user: loan.student,
    category: NOTIFICATION_CATEGORIES.CIRCULATION,
    type: NOTIFICATION_TYPES.LOAN_RENEWED,
    title: "Loan renewed",
    message: `"${loan.book.title}" is now due back on ${newDueDate.toLocaleDateString()}.`,
    link: "/loans",
    relatedEntity: { kind: "Loan", id: loan._id },
  });

  return attachComputed(loan.toObject());
};

export const setLoanDueDateForTesting = async (loanId, dueDate) => {
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(404, "Not found");
  }

  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new ApiError(404, "Loan not found");
  }

  if (loan.status !== LOAN_STATUS.ACTIVE) {
    throw new ApiError(
      409,
      `Cannot modify due date for a loan that is ${loan.status}`,
    );
  }

  const parsedDueDate = new Date(dueDate);

  if (Number.isNaN(parsedDueDate.getTime())) {
    throw new ApiError(422, "Invalid due date");
  }

  loan.dueDate = parsedDueDate;
  await loan.save();

  return loan;
};
