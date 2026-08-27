import mongoose from "mongoose";
import { LOAN_STATUS, LOAN_STATUS_VALUES } from "../constants/loanStatus.js";

const loanSchema = new mongoose.Schema(
  {
    // One loan per request, ever — collecting a request is a one-way
    // transition (see physicalRequestService/loanService), so this
    // stays a straightforward one-to-one rather than needing its own
    // uniqueness workaround.
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhysicalRequest",
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
      index: true,
    },
    copy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCopy",
      required: true,
      index: true,
    },
    collectedAt: {
      type: Date,
      required: true,
    },
    // Copied from the request's requestedReturnDate at collection time.
    // No renewal/extension mechanism exists yet — this field is where
    // one would eventually update it.
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: LOAN_STATUS_VALUES,
      default: LOAN_STATUS.ACTIVE,
      index: true,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

loanSchema.index({ student: 1, status: 1 });

export default mongoose.model("Loan", loanSchema);
