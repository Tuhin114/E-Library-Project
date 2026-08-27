import Loan from "../models/Loan.js";
import PhysicalRequest from "../models/PhysicalRequest.js";
import BookCopy from "../models/BookCopy.js";
import { ApiError } from "../utils/ApiError.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { COPY_STATUS } from "../constants/copyStatus.js";
import * as bookCopyService from "./bookCopyService.js";
import { expireStaleApprovals } from "./physicalRequestService.js";

const LOAN_POPULATE = [
  { path: "student", select: "name email" },
  { path: "book", select: "title isbn coverImage" },
  { path: "copy", select: "copyNumber condition" },
];

// isOverdue is deliberately computed at read time, not stored — a loan
// is overdue the instant "now" passes its dueDate, with no event
// required to make that true. Storing it would mean either a background
// job to flip it or a stale flag between reads; computing it fresh
// avoids both.
const attachComputed = (loan) => ({
  ...loan,
  isOverdue: loan.status === LOAN_STATUS.ACTIVE && new Date(loan.dueDate) < new Date(),
});

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

export const listLoansForLibrarian = async ({ status } = {}) => {
  const loans = await Loan.find({ ...(status && { status }) })
    .populate(LOAN_POPULATE)
    .sort({ collectedAt: -1 })
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
