import mongoose from "mongoose";
import { COPY_STATUS, COPY_STATUS_VALUES, COPY_CONDITION, COPY_CONDITION_VALUES } from "../constants/copyStatus.js";

const bookCopySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    copyNumber: {
      type: String,
      required: [true, "Copy number is required"],
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: COPY_STATUS_VALUES,
      default: COPY_STATUS.AVAILABLE,
    },
    condition: {
      type: String,
      enum: COPY_CONDITION_VALUES,
      default: COPY_CONDITION.GOOD,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    acquiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

bookCopySchema.index({ book: 1, status: 1 });

export default mongoose.model("BookCopy", bookCopySchema);
