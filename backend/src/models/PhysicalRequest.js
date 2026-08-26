import mongoose from "mongoose";
import {
  REQUEST_STATUS,
  REQUEST_STATUS_VALUES,
} from "../constants/requestStatus.js";

const physicalRequestSchema = new mongoose.Schema(
  {
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
    requestedCollectionDate: {
      type: Date,
      required: true,
    },
    requestedReturnDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUS_VALUES,
      default: REQUEST_STATUS.PENDING,
      index: true,
    },
    // Human-friendly reference the student can quote at the desk —
    // generated once from the document's own id, never regenerated.
    referenceCode: {
      type: String,
      unique: true,
    },
    studentNote: {
      type: String,
      trim: true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default: "",
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    decidedAt: {
      type: Date,
      default: null,
    },
    // Holds the librarian's approval note OR rejection reason OR the
    // student's own cancellation isn't recorded here (cancellation has
    // no "why" field at this milestone) — whichever decision produced
    // the current status.
    decisionReason: {
      type: String,
      trim: true,
      maxlength: [300, "Reason cannot exceed 300 characters"],
      default: "",
    },
  },
  { timestamps: true },
);

// Powers both the librarian queue's default sort and the overlap check
// used to build conflict context for a given book/window.
physicalRequestSchema.index({ book: 1, status: 1, requestedCollectionDate: 1 });

physicalRequestSchema.pre("validate", function generateReferenceCode(next) {
  if (!this.referenceCode) {
    this.referenceCode = `PR-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("PhysicalRequest", physicalRequestSchema);
