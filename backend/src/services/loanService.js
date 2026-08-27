import Loan from "../models/Loan.js";
import PhysicalRequest from "../models/PhysicalRequest.js";
import BookCopy from "../models/BookCopy.js";
import { ApiError } from "../utils/ApiError.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { COPY_STATUS, COPY_CONDITION } from "../constants/copyStatus.js";
import * as bookCopyService from "./bookCopyService.js";
import * as feeService from "./feeService.js";
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
  const isOverdue = loan.status === LOAN_STATUS.ACTIVE && new Date(loan.dueDate) < new Date();
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

  let copy;
  if (copyId) {
    copy = await BookCopy.findById(copyId);
    if (!copy) throw new ApiError(404, "Copy not found");
    if (copy.book.toString() !== request.book.toString()) {
      throw new ApiError(400, "This copy does not belong to the requested book");
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

export const listLoansForStudent = async (studentId, { status } = {}) => {
  const loans = await Loan.find({ student: studentId, ...(status && { status }) })
    .populate(LOAN_POPULATE)
    .sort({ collectedAt: -1 })
    .lean();

  return loans.map(attachComputed);
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

  return attachComputed(loan);
};

// M4 — the return step. A copy returned in "poor" condition doesn't go
// straight back into circulation: it's flagged damaged so a librarian
// has to look at it before anyone else can borrow it. Anything else
// (new/good/fair) returns to available. A late fee is created here, and
// only here — see feeService.createFeeForLateReturn.
export const returnLoan = async (loanId, librarian, { condition, notes }) => {
  const loan = await Loan.findById(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");
  if (loan.status !== LOAN_STATUS.ACTIVE) {
    throw new ApiError(409, `Cannot return a loan that is already ${loan.status}`);
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

  const nextCopyStatus =
    condition === COPY_CONDITION.POOR ? COPY_STATUS.DAMAGED : COPY_STATUS.AVAILABLE;
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

  const populated = await loan.populate(LOAN_POPULATE);
  return { loan: attachComputed(populated.toObject()), fee };
};
