import mongoose from "mongoose";
import {
  FEE_STATUS,
  FEE_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from "../constants/feeStatus.js";
import { FEE_TYPE, FEE_TYPE_VALUES } from "../constants/feeType.js";

const feeSchema = new mongoose.Schema(
  {
    // M3 (Phase 7) — no longer unique on its own: a single loan can now
    // generate up to two fees (a late fee from returnLoan's overdue
    // check, and a separate damage fee from the same return if the copy
    // came back in poor condition). Uniqueness moves to the (loan, type)
    // compound index below instead, which still blocks the one real
    // duplicate risk — the same loan producing two fees of the *same*
    // type (e.g. two damage fees), which can't legitimately happen since
    // both returnLoan and loanService.reportLoanLost each only ever run
    // once per loan (both guard on loan.status === ACTIVE first).
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    // M3 (Phase 7) — defaults to "late" so every fee created before this
    // field existed (M4's original late fees) still reads correctly
    // without a migration.
    type: {
      type: String,
      enum: FEE_TYPE_VALUES,
      default: FEE_TYPE.LATE,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Only meaningful for type: "late" — a damage/lost fee has no
    // "days overdue" concept, so this stays null for those.
    daysLate: {
      type: Number,
      min: 1,
      default: null,
    },
    status: {
      type: String,
      enum: FEE_STATUS_VALUES,
      default: FEE_STATUS.OUTSTANDING,
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      default: null,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // M3 (Phase 7) — set only when a librarian waives the fee via
    // PATCH /fees/:id/waive. waivedReason is required at the service/
    // validator layer (same min-length pattern as request rejection),
    // not enforced as a Mongoose conditional-required here.
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    waivedReason: {
      type: String,
      trim: true,
      default: "",
    },
    waivedAt: {
      type: Date,
      default: null,
    },
    // M3 (Phase 7) — snapshot of the replacement-cost figure used to
    // prefill this fee's amount at creation (Book.replacementCost, or
    // LibrarySettings.defaultReplacementCost if the book has none set).
    // Kept even if a librarian later adjusts `amount` at finalize time,
    // as an audit trail of what was originally suggested — same "not
    // read by any business logic" spirit as Loan.renewalHistory. Null
    // for late fees, which have no replacement-cost concept.
    replacementCost: {
      type: Number,
      default: null,
    },
    // The fee record itself, once paid, doubles as the payment receipt —
    // same "receipt is a view of state, not a separate document" pattern
    // PhysicalRequest.referenceCode established in M2.
    receiptReference: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

feeSchema.index({ loan: 1, type: 1 }, { unique: true });

feeSchema.pre("validate", function generateReceiptReference(next) {
  if (!this.receiptReference) {
    this.receiptReference = `FEE-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Fee", feeSchema);
