import mongoose from "mongoose";
import { LOAN_STATUS, LOAN_STATUS_VALUES } from "../constants/loanStatus.js";
import { COPY_CONDITION_VALUES } from "../constants/copyStatus.js";

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
    // M4 — recorded at the moment of return, distinct from the copy's
    // own ongoing `condition` field (which bookCopyService updates to
    // match, once the return is processed).
    returnCondition: {
      type: String,
      enum: COPY_CONDITION_VALUES,
      default: null,
    },
    returnProcessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

loanSchema.index({ student: 1, status: 1 });

export default mongoose.model("Loan", loanSchema);
