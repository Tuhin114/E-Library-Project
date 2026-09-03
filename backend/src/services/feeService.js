import Fee from "../models/Fee.js";
import Book from "../models/Book.js";
import { ApiError } from "../utils/ApiError.js";
import { FEE_STATUS, PAYMENT_METHOD } from "../constants/feeStatus.js";
import { FEE_TYPE } from "../constants/feeType.js";
import { DAILY_LATE_FEE_RATE, MAX_LATE_FEE } from "../constants/feePolicy.js";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import * as librarySettingsService from "./librarySettingsService.js";
import * as notificationService from "./notificationService.js";

const FEE_POPULATE = [
  { path: "student", select: "name email" },
  { path: "book", select: "title isbn" },
  { path: "loan", select: "collectedAt dueDate returnedAt returnCondition" },
];

export const calculateLateFee = (daysLate) =>
  Math.min(Number((daysLate * DAILY_LATE_FEE_RATE).toFixed(2)), MAX_LATE_FEE);

// Called by loanService.returnLoan the moment a late return is
// processed — a late fee only ever comes into existence this way,
// there's no separate "create a late fee" endpoint. Deterministic
// amount, so it's created straight into OUTSTANDING, same as before M3.
export const createFeeForLateReturn = async ({ loanId, studentId, bookId, daysLate }) => {
  const fee = await Fee.create({
    loan: loanId,
    student: studentId,
    book: bookId,
    type: FEE_TYPE.LATE,
    status: FEE_STATUS.OUTSTANDING,
    amount: calculateLateFee(daysLate),
    daysLate,
  });

  return fee.populate(FEE_POPULATE);
};

// M3 (Phase 7) — called from two places: loanService.returnLoan (when a
// copy comes back in "poor" condition) and loanService.reportLoanLost.
// Unlike a late fee, the amount here is a judgment call, not a
// deterministic calculation — the fee is created PENDING_REVIEW rather
// than OUTSTANDING, prefilled with a suggested amount so the librarian
// isn't starting from zero, but the student isn't notified and it
// doesn't count against them until PATCH /fees/:id/finalize confirms it.
export const createFeeForDamageOrLoss = async ({ loanId, studentId, bookId, type }) => {
  const [book, settings] = await Promise.all([
    Book.findById(bookId).select("replacementCost").lean(),
    librarySettingsService.getSettings(),
  ]);

  const replacementCost = book?.replacementCost ?? settings.defaultReplacementCost;

  const fee = await Fee.create({
    loan: loanId,
    student: studentId,
    book: bookId,
    type,
    status: FEE_STATUS.PENDING_REVIEW,
    amount: replacementCost,
    replacementCost,
  });

  return fee.populate(FEE_POPULATE);
};

export const listFeesForStudent = async (studentId, { status } = {}) => {
  const filter = { student: studentId };

  // PENDING_REVIEW fees are librarian-only and don't appear on the
  // student's own list until finalized — explicitly requesting
  // status=pending_review is treated the same as no filter at all,
  // still excluding it, rather than honored, since a student has no
  // legitimate reason to see a fee that hasn't been confirmed yet.
  filter.status =
    status && status !== FEE_STATUS.PENDING_REVIEW ? status : { $ne: FEE_STATUS.PENDING_REVIEW };

  return Fee.find(filter).populate(FEE_POPULATE).sort({ createdAt: -1 }).lean();
};

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

// Phase 9 M2 — narrowed to librarian-only. The student-self-pay branch
// this used to have is what POST /fees/:id/checkout + the Razorpay
// webhook (paymentService.handleWebhookEvent) replace. This function
// now models exactly one action: a librarian recording an in-person
// payment at the desk, which never touches the gateway.
export const payFee = async (feeId, payer) => {
  const fee = await assertFeeExists(feeId);

  if (payer.role !== "librarian") {
    throw new ApiError(403, "You do not have access to this fee");
  }
  if (fee.status !== FEE_STATUS.OUTSTANDING) {
    throw new ApiError(409, `Cannot pay a fee that is ${fee.status}, not outstanding`);
  }

  fee.status = FEE_STATUS.PAID;
  fee.paidAt = new Date();
  fee.paymentMethod = PAYMENT_METHOD.IN_PERSON;
  fee.paidBy = payer._id;
  await fee.save();

  return fee.populate(FEE_POPULATE);
};

// Phase 9 M2 — the counterpart payFee no longer covers: marks a fee
// PAID from the Razorpay webhook once the sandboxed payment link is
// actually paid. Kept separate from payFee rather than reused with a
// flag, since payFee's role check and IN_PERSON assumption don't apply
// here.
export const markFeePaidFromWebhook = async (feeId, { paidBy = null } = {}) => {
  const fee = await assertFeeExists(feeId);

  if (fee.status === FEE_STATUS.PAID) {
    // Idempotency guard — Razorpay can and will redeliver the same
    // webhook event more than once. Returning the already-paid fee
    // instead of throwing keeps a redelivered event a harmless no-op.
    return fee.populate(FEE_POPULATE);
  }

  if (fee.status !== FEE_STATUS.OUTSTANDING) {
    throw new ApiError(
      409,
      `Cannot mark a fee paid from a webhook when it is ${fee.status}, not outstanding`,
    );
  }

  fee.status = FEE_STATUS.PAID;
  fee.paidAt = new Date();
  fee.paymentMethod = PAYMENT_METHOD.ONLINE;
  fee.paidBy = paidBy || fee.student;
  await fee.save();

  return fee.populate(FEE_POPULATE);
};

// M3 (Phase 7) — librarian confirms (or adjusts) a PENDING_REVIEW fee's
// amount, moving it to OUTSTANDING and notifying the student for the
// first time. If `amount` is omitted, the prefilled replacementCost
// value the fee was created with is kept as-is.
export const finalizeFee = async (feeId, librarian, { amount } = {}) => {
  const fee = await assertFeeExists(feeId);

  if (fee.status !== FEE_STATUS.PENDING_REVIEW) {
    throw new ApiError(409, `Cannot finalize a fee that is ${fee.status}, not pending review`);
  }

  if (amount !== undefined) fee.amount = amount;
  fee.status = FEE_STATUS.OUTSTANDING;
  await fee.save();

  await notificationService.notify({
    user: fee.student,
    category: NOTIFICATION_CATEGORIES.ACCOUNT,
    type: NOTIFICATION_TYPES.FEE_CHARGED,
    title: "A fee has been added to your account",
    message: `A ${fee.type} fee of $${fee.amount.toFixed(2)} for "${fee.book.title}" is now due.`,
    link: "/fees",
    relatedEntity: { kind: "Fee", id: fee._id },
  });

  return fee.populate(FEE_POPULATE);
};

// M3 (Phase 7) — librarian waives a fee outright, from either
// PENDING_REVIEW or OUTSTANDING (a damage claim can be waived without
// ever being finalized, e.g. "not the student's fault" — finalizing an
// amount first isn't required). Reason is required, same min-length
// validation pattern as request rejection.
export const waiveFee = async (feeId, librarian, { reason }) => {
  const fee = await assertFeeExists(feeId);

  if ([FEE_STATUS.PAID, FEE_STATUS.WAIVED].includes(fee.status)) {
    throw new ApiError(409, `Cannot waive a fee that is already ${fee.status}`);
  }

  fee.status = FEE_STATUS.WAIVED;
  fee.waivedBy = librarian._id;
  fee.waivedReason = reason;
  fee.waivedAt = new Date();
  await fee.save();

  await notificationService.notify({
    user: fee.student,
    category: NOTIFICATION_CATEGORIES.ACCOUNT,
    type: NOTIFICATION_TYPES.FEE_WAIVED,
    title: "A fee has been waived",
    message: `Your ${fee.type} fee for "${fee.book.title}" has been waived.`,
    link: "/fees",
    relatedEntity: { kind: "Fee", id: fee._id },
  });

  return fee.populate(FEE_POPULATE);
};
