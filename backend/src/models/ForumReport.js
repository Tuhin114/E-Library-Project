import mongoose from "mongoose";
import {
  REPORT_REASON_VALUES,
  REPORT_TARGET_TYPE_VALUES,
  REPORT_STATUS,
  REPORT_STATUS_VALUES,
} from "../constants/reportReasons.js";

const forumReportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: REPORT_TARGET_TYPE_VALUES,
      required: true,
    },
    // Not a `ref` — targetType decides whether this points at a
    // ForumThread or a ForumReply. forumReportService resolves the
    // preview text manually rather than via Mongoose refPath, since
    // reports are read rarely (moderation queue only) and don't need
    // populate() convenience badly enough to justify the extra field.
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASON_VALUES,
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: [500, "Details cannot exceed 500 characters"],
      default: "",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUS_VALUES,
      default: REPORT_STATUS.OPEN,
    },
  },
  { timestamps: true },
);

// One report per user per target — repeated reporting of the same
// post doesn't push it further up a queue, it just clutters it.
forumReportSchema.index({ targetType: 1, targetId: 1, reportedBy: 1 }, { unique: true });

const ForumReport = mongoose.model("ForumReport", forumReportSchema);

export default ForumReport;
