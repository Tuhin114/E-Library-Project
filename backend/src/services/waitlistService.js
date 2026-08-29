import Waitlist from "../models/Waitlist.js";
import Book from "../models/Book.js";
import BookCopy from "../models/BookCopy.js";
import PhysicalRequest from "../models/PhysicalRequest.js";
import { ApiError } from "../utils/ApiError.js";
import { WAITLIST_STATUS, ACTIVE_WAITLIST_STATUSES } from "../constants/waitlistStatus.js";
import { COPY_STATUS } from "../constants/copyStatus.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import * as bookCopyService from "./bookCopyService.js";
import * as librarySettingsService from "./librarySettingsService.js";
import * as notificationService from "./notificationService.js";

const BOOK_POPULATE = { path: "book", select: "title coverImage physicalCopiesTotal physicalCopiesAvailable" };
const USER_POPULATE = { path: "user", select: "name email" };

export const joinWaitlist = async (bookId, userId) => {
  const book = await Book.findById(bookId).select("title physicalCopiesTotal physicalCopiesAvailable");
  if (!book) throw new ApiError(404, "Book not found");

  if (book.physicalCopiesTotal < 1) {
    throw new ApiError(400, "This book has no physical copies configured for request");
  }
  // The whole point of a waitlist is queuing for a copy that isn't
  // currently free — if one is, the normal request flow (POST
  // /requests) is the right path, not this one.
  if (book.physicalCopiesAvailable > 0) {
    throw new ApiError(
      400,
      "Copies are currently available for this book — request it directly instead of joining the waitlist",
    );
  }

  let entry;
  try {
    entry = await Waitlist.create({ book: bookId, user: userId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "You're already on the waitlist for this book");
    }
    throw error;
  }

  return entry.populate([BOOK_POPULATE, USER_POPULATE]);
};

// Librarian-facing queue for one book. Only WAITING entries get a
// ranked position — a NOTIFIED entry has already been served a copy
// and is shown separately with its claim countdown, not as "next in
// line" alongside people still actually waiting.
export const listForBook = async (bookId) => {
  const entries = await Waitlist.find({ book: bookId, status: { $in: ACTIVE_WAITLIST_STATUSES } })
    .sort({ createdAt: 1 })
    .populate(USER_POPULATE)
    .lean();

  let position = 0;
  return entries.map((entry) => {
    if (entry.status === WAITLIST_STATUS.WAITING) {
      position += 1;
      return { ...entry, position };
    }
    return { ...entry, position: null };
  });
};

// Student-facing "my waitlist" list, across every book. Position is
// computed per entry (count of still-waiting entries for that book
// created at-or-before this one) rather than reusing listForBook,
// since these entries span many different books' independent queues.
export const listForUser = async (userId) => {
  const entries = await Waitlist.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate(BOOK_POPULATE)
    .lean();

  return Promise.all(
    entries.map(async (entry) => {
      if (entry.status !== WAITLIST_STATUS.WAITING) {
        return { ...entry, position: null };
      }
      const position = await Waitlist.countDocuments({
        book: entry.book._id,
        status: WAITLIST_STATUS.WAITING,
        createdAt: { $lte: entry.createdAt },
      });
      return { ...entry, position };
    }),
  );
};

const assertOwnedActiveEntry = async (waitlistId, userId) => {
  const entry = await Waitlist.findById(waitlistId);
  if (!entry) throw new ApiError(404, "Waitlist entry not found");
  if (entry.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only manage your own waitlist entries");
  }
  return entry;
};

export const cancelWaitlistEntry = async (waitlistId, userId) => {
  const entry = await assertOwnedActiveEntry(waitlistId, userId);

  if (!ACTIVE_WAITLIST_STATUSES.includes(entry.status)) {
    throw new ApiError(409, `Cannot leave a waitlist entry that is already ${entry.status}`);
  }

  const releaseCopyId = entry.status === WAITLIST_STATUS.NOTIFIED ? entry.reservedCopy : null;

  entry.status = WAITLIST_STATUS.CANCELLED;
  await entry.save();

  // Releasing the copy back to AVAILABLE runs through the same
  // bookCopyService.updateCopy() path every other release does, which
  // is what triggers promoteNextWaiter() for whoever's next in line —
  // this function doesn't need to know how to cascade, only that
  // releasing the copy is what causes it.
  if (releaseCopyId) {
    await bookCopyService.updateCopy(releaseCopyId, { status: COPY_STATUS.AVAILABLE });
  }

  return entry;
};

// M2's actual composition point with circulation: converts a NOTIFIED
// hold into a real, already-approved PhysicalRequest bound to the copy
// reserved for this specific user. The librarian still has to process
// collection normally (PATCH /requests/:id/collect) — claiming doesn't
// skip the physical handover step, only the approval step, since the
// copy is already provably theirs.
export const claimWaitlistEntry = async (waitlistId, userId, { requestedReturnDate } = {}) => {
  const entry = await assertOwnedActiveEntry(waitlistId, userId);

  if (entry.status !== WAITLIST_STATUS.NOTIFIED) {
    throw new ApiError(409, `Cannot claim a waitlist entry that is ${entry.status}, not notified`);
  }
  if (entry.claimExpiresAt && entry.claimExpiresAt < new Date()) {
    // Safety net for the window between the hold actually lapsing and
    // the expiry job's next sweep picking it up — the claim itself
    // must never succeed past the deadline even if the job hasn't run
    // yet.
    throw new ApiError(409, "This hold has expired");
  }

  const copy = await BookCopy.findById(entry.reservedCopy);
  if (!copy || copy.status !== COPY_STATUS.RESERVED) {
    throw new ApiError(409, "The copy reserved for this hold is no longer available");
  }

  const collectionDate = new Date();
  const returnDate = requestedReturnDate
    ? new Date(requestedReturnDate)
    : new Date(collectionDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  const request = await PhysicalRequest.create({
    student: userId,
    book: entry.book,
    requestedCollectionDate: collectionDate,
    requestedReturnDate: returnDate,
    studentNote: "Claimed from waitlist hold",
    status: REQUEST_STATUS.APPROVED,
    decidedAt: new Date(),
    decisionReason: "Auto-approved — claimed from a waitlist hold",
    autoApproved: true,
    reservedCopy: copy._id,
  });

  entry.status = WAITLIST_STATUS.FULFILLED;
  entry.fulfilledRequest = request._id;
  await entry.save();

  return request.populate([
    { path: "student", select: "name email role" },
    { path: "book", select: "title isbn coverImage physicalCopiesTotal physicalCopiesAvailable" },
  ]);
};

// The other half of M2's composition point: called by
// bookCopyService.updateCopy() whenever any copy of a book transitions
// TO `available` (a return being processed, a librarian manually
// freeing a copy, or a waitlist hold being released unclaimed/expired/
// cancelled). Promotes the oldest still-WAITING entry, if any, by
// reserving that same freshly-freed copy for them and starting their
// claim window.
export const promoteNextWaiter = async (bookId) => {
  const nextWaiting = await Waitlist.findOne({
    book: bookId,
    status: WAITLIST_STATUS.WAITING,
  }).sort({ createdAt: 1 });
  if (!nextWaiting) return null;

  const copy = await bookCopyService.findAvailableCopyForBook(bookId);
  if (!copy) return null; // race safety — nothing actually free right now

  await bookCopyService.updateCopy(copy._id, { status: COPY_STATUS.RESERVED });

  const settings = await librarySettingsService.getSettings();
  const claimWindowMs = settings.waitlistClaimWindowHours * 60 * 60 * 1000;

  nextWaiting.status = WAITLIST_STATUS.NOTIFIED;
  nextWaiting.notifiedAt = new Date();
  nextWaiting.claimExpiresAt = new Date(Date.now() + claimWindowMs);
  nextWaiting.reservedCopy = copy._id;
  await nextWaiting.save();

  const book = await Book.findById(bookId).select("title").lean();
  const claimByLabel = nextWaiting.claimExpiresAt.toLocaleString();

  await notificationService.notify({
    user: nextWaiting.user,
    category: NOTIFICATION_CATEGORIES.CIRCULATION,
    type: NOTIFICATION_TYPES.WAITLIST_READY,
    title: "A copy is ready for you",
    message: `A copy of "${book?.title ?? "your book"}" is being held for you. Claim it by ${claimByLabel} or it will go to the next person in line.`,
    link: "/waitlist",
    relatedEntity: { kind: "Waitlist", id: nextWaiting._id },
  });

  return nextWaiting;
};

// Whether a book currently has anyone actively queued — the exact
// check loanService.renewLoan uses to block a renewal that would keep
// a waiting reader waiting even longer.
export const hasActiveWaitlist = (bookId) =>
  Waitlist.exists({ book: bookId, status: { $in: ACTIVE_WAITLIST_STATUSES } });

// Batch version of hasActiveWaitlist for list views (loanService's
// "my loans" page needs this per-loan without an N+1 query per row).
export const getBookIdsWithActiveWaitlist = async (bookIds) => {
  const ids = await Waitlist.find({
    book: { $in: bookIds },
    status: { $in: ACTIVE_WAITLIST_STATUSES },
  }).distinct("book");
  return new Set(ids.map(String));
};
