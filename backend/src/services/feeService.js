import Fee from "../models/Fee.js";
import { ApiError } from "../utils/ApiError.js";
import { FEE_STATUS, PAYMENT_METHOD } from "../constants/feeStatus.js";
import { DAILY_LATE_FEE_RATE, MAX_LATE_FEE } from "../constants/feePolicy.js";

const FEE_POPULATE = [
  { path: "student", select: "name email" },
  { path: "book", select: "title isbn" },
  { path: "loan", select: "collectedAt dueDate returnedAt returnCondition" },
];

export const calculateLateFee = (daysLate) =>
  Math.min(Number((daysLate * DAILY_LATE_FEE_RATE).toFixed(2)), MAX_LATE_FEE);

// Called by loanService.returnLoan the moment a late return is
// processed — a fee only ever comes into existence this way in M4,
// there's no separate "create a fee" endpoint.
export const createFeeForLateReturn = async ({ loanId, studentId, bookId, daysLate }) => {
  const fee = await Fee.create({
    loan: loanId,
    student: studentId,
    book: bookId,
    amount: calculateLateFee(daysLate),
    daysLate,
  });

  return fee.populate(FEE_POPULATE);
};

export const listFeesForStudent = async (studentId, { status } = {}) =>
  Fee.find({ student: studentId, ...(status && { status }) })
    .populate(FEE_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

export const listFeesForLibrarian = async ({ status } = {}) =>
  Fee.find({ ...(status && { status }) })
    .populate(FEE_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

const assertFeeExists = async (feeId) => {
  const fee = await Fee.findById(feeId).populate(FEE_POPULATE);
  if (!fee) throw new ApiError(404, "Fee not found");
  return fee;
};

export const getFeeById = async (feeId, requester) => {
  const fee = await assertFeeExists(feeId);

  const isOwner = fee.student._id.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this fee");
  }

  return fee;
};

// The payment method is derived from who's calling, never trusted from
// the request body — a librarian paying on a student's behalf is always
// "in_person"; the student paying their own fee is always "online".
// This keeps the audit trail (paidBy + paymentMethod) honest by
// construction rather than by convention.
export const payFee = async (feeId, payer) => {
  const fee = await assertFeeExists(feeId);

  const isOwner = fee.student._id.toString() === payer._id.toString();
  const isLibrarian = payer.role === "librarian";
  if (!isOwner && !isLibrarian) {
    throw new ApiError(403, "You do not have access to this fee");
  }
  if (fee.status !== FEE_STATUS.OUTSTANDING) {
    throw new ApiError(409, "This fee has already been paid");
  }

  fee.status = FEE_STATUS.PAID;
  fee.paidAt = new Date();
  fee.paymentMethod = isLibrarian ? PAYMENT_METHOD.IN_PERSON : PAYMENT_METHOD.ONLINE;
  fee.paidBy = payer._id;
  await fee.save();

  return fee.populate(FEE_POPULATE);
};
