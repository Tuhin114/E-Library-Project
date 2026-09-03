import PhysicalRequest from "../models/PhysicalRequest.js";
import Fee from "../models/Fee.js";
import Loan from "../models/Loan.js";
import { ApiError } from "../utils/ApiError.js";
import { buildReceiptPdf } from "../utils/receiptGenerator.js";
import { REQUEST_STATUS } from "../constants/requestStatus.js";
import { FEE_STATUS } from "../constants/feeStatus.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

const assertAccess = (ownerId, requester) => {
  const isOwner = ownerId.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this receipt");
  }
};

const REQUEST_RECEIPT_STATUSES = [REQUEST_STATUS.APPROVED, REQUEST_STATUS.COLLECTED];

export const generateRequestReceipt = async (requestId, requester) => {
  const request = await PhysicalRequest.findById(requestId)
    .populate("student", "name email")
    .populate("book", "title isbn");

  if (!request) throw new ApiError(404, "Request not found");
  assertAccess(request.student._id, requester);

  if (!REQUEST_RECEIPT_STATUSES.includes(request.status)) {
    throw new ApiError(
      409,
      `Cannot generate a receipt for a request that is ${request.status}. A receipt is only available once a request is approved or collected.`,
    );
  }

  const fields = [
    { label: "Student", value: request.student.name },
    { label: "Book", value: request.book.title },
    { label: "ISBN", value: request.book.isbn },
    { label: "Status", value: request.status },
    {
      label: "Collection window",
      value: `${formatDate(request.requestedCollectionDate)} – ${formatDate(request.requestedReturnDate)}`,
    },
    {
      label: request.autoApproved ? "Approved (automatic)" : "Approved by",
      value: request.autoApproved ? "Auto-approval engine" : formatDate(request.decidedAt),
    },
  ];

  const pdfBuffer = await buildReceiptPdf({
    title: "Physical Copy Request Receipt",
    referenceCode: request.referenceCode,
    statusLine:
      request.status === REQUEST_STATUS.COLLECTED
        ? "This request has already been collected."
        : "Approved — awaiting collection.",
    fields,
    footerNote: "Present this receipt (or read the reference code above) at the circulation desk to collect your book.",
  });

  return { pdfBuffer, filename: `request-receipt-${request.referenceCode}.pdf` };
};

export const generateFeeReceipt = async (feeId, requester) => {
  const fee = await Fee.findById(feeId).populate("student", "name email").populate("book", "title isbn");

  if (!fee) throw new ApiError(404, "Fee not found");
  assertAccess(fee.student._id, requester);

  if (fee.status !== FEE_STATUS.PAID) {
    throw new ApiError(409, `Cannot generate a receipt for a fee that is ${fee.status}, not paid.`);
  }

  const fields = [
    { label: "Student", value: fee.student.name },
    { label: "Book", value: fee.book.title },
    { label: "Fee type", value: fee.type },
    { label: "Amount", value: `$${fee.amount.toFixed(2)}` },
    { label: "Payment method", value: fee.paymentMethod === "online" ? "Online (card)" : "In-person" },
    { label: "Paid on", value: formatDate(fee.paidAt) },
  ];

  const pdfBuffer = await buildReceiptPdf({
    title: "Payment Receipt",
    referenceCode: fee.receiptReference,
    statusLine: "Payment confirmed.",
    fields,
    footerNote: "Keep this receipt for your records.",
  });

  return { pdfBuffer, filename: `payment-receipt-${fee.receiptReference}.pdf` };
};

const LOAN_RECEIPT_STATUSES = [LOAN_STATUS.ACTIVE, LOAN_STATUS.RETURNED, LOAN_STATUS.LOST];

export const generateLoanReceipt = async (loanId, requester) => {
  const loan = await Loan.findById(loanId)
    .populate("student", "name email")
    .populate("book", "title isbn")
    .populate("request", "referenceCode");

  if (!loan) throw new ApiError(404, "Loan not found");
  assertAccess(loan.student._id, requester);

  if (!LOAN_RECEIPT_STATUSES.includes(loan.status)) {
    throw new ApiError(409, `Cannot generate a receipt for a loan that is ${loan.status}.`);
  }

  const referenceCode =
    loan.request?.referenceCode || `LOAN-${loan._id.toString().slice(-8).toUpperCase()}`;

  const fields = [
    { label: "Student", value: loan.student.name },
    { label: "Book", value: loan.book.title },
    { label: "Collected on", value: formatDate(loan.collectedAt) },
    { label: "Due date", value: formatDate(loan.dueDate) },
    { label: "Status", value: loan.status },
    ...(loan.status === LOAN_STATUS.RETURNED
      ? [{ label: "Returned on", value: formatDate(loan.returnedAt) }]
      : []),
  ];

  const pdfBuffer = await buildReceiptPdf({
    title: "Loan Receipt",
    referenceCode,
    statusLine: `Loan status: ${loan.status}.`,
    fields,
    footerNote: "This receipt confirms the above book was collected from the library.",
  });

  return { pdfBuffer, filename: `loan-receipt-${referenceCode}.pdf` };
};
