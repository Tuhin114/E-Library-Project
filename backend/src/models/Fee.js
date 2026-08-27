import mongoose from "mongoose";
import {
  FEE_STATUS,
  FEE_STATUS_VALUES,
  PAYMENT_METHOD_VALUES,
} from "../constants/feeStatus.js";

const feeSchema = new mongoose.Schema(
  {
    // One fee per loan, ever — M4 only generates a fee at the moment of
    // a late return, so a loan can never accumulate more than one.
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      unique: true,
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    daysLate: {
      type: Number,
      required: true,
      min: 1,
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

feeSchema.pre("validate", function generateReceiptReference(next) {
  if (!this.receiptReference) {
    this.receiptReference = `FEE-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Fee", feeSchema);
