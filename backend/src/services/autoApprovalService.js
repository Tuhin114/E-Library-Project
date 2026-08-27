import PhysicalRequest from "../models/PhysicalRequest.js";
import Loan from "../models/Loan.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import * as bookCopyService from "./bookCopyService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// The core safety question: can we prove a copy will genuinely be free
// for this new window, without pretending a previous borrower will
// always return exactly on schedule?
//
// Every existing commitment on this book — an active loan, or an
// approved-but-not-yet-collected request — is modeled as occupying an
// interval that runs past its own due/return date by `bufferDays`,
// because a scheduled return date is a promise, not a guarantee. A new
// request only gets auto-approved when, even after counting every
// commitment whose (buffered) interval overlaps the new window, there
// are still more usable copies than overlapping commitments — i.e.
// there's *always* at least one copy free throughout the whole window,
// not just "probably" free on average.
//
// If a loan for this book is already overdue, that's a stronger signal
// than any buffer math can offset — auto-approval is blocked outright,
// for every request on this book, until it's resolved. Any case this
// function can't prove safe returns `approved: false` with a reason;
// the caller (physicalRequestService.createRequest) leaves the request
// pending rather than auto-rejecting — this engine only ever says
// "yes, safely" or "not sure, ask a human."
export const evaluateAutoApproval = async (
  bookId,
  requestedCollectionDate,
  requestedReturnDate,
  bufferDays,
) => {
  const now = new Date();
  const bufferMs = bufferDays * DAY_MS;

  const overdueExists = await Loan.exists({
    book: bookId,
    status: LOAN_STATUS.ACTIVE,
    dueDate: { $lt: now },
  });
  if (overdueExists) {
    return {
      approved: false,
      reason: "A loan for this book is currently overdue — auto-approval is paused until it's resolved",
    };
  }

  const usableCopies = await bookCopyService.getUsableCopyCount(bookId);
  if (usableCopies < 1) {
    return { approved: false, reason: "No usable physical copies exist for this book" };
  }

  const [activeLoans, approvedRequests] = await Promise.all([
    Loan.find({ book: bookId, status: LOAN_STATUS.ACTIVE })
      .select("collectedAt dueDate")
      .lean(),
    PhysicalRequest.find({ book: bookId, status: REQUEST_STATUS.APPROVED })
      .select("requestedCollectionDate requestedReturnDate")
      .lean(),
  ]);

  const commitments = [
    ...activeLoans.map((loan) => ({
      start: loan.collectedAt,
      end: new Date(loan.dueDate.getTime() + bufferMs),
    })),
    ...approvedRequests.map((request) => ({
      start: request.requestedCollectionDate,
      end: new Date(request.requestedReturnDate.getTime() + bufferMs),
    })),
  ];

  const overlapping = commitments.filter(
    (commitment) => commitment.start <= requestedReturnDate && commitment.end >= requestedCollectionDate,
  );

  if (overlapping.length < usableCopies) {
    return { approved: true, reason: "Sufficient capacity confirmed for the requested window" };
  }

  return {
    approved: false,
    reason: `Capacity uncertain — ${overlapping.length} existing commitment(s) overlap this window against ${usableCopies} usable ${usableCopies === 1 ? "copy" : "copies"}`,
  };
};
