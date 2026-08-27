import mongoose from "mongoose";
import { APPROVAL_MODE, APPROVAL_MODE_VALUES } from "../constants/approvalMode.js";
import { DEFAULT_AUTO_APPROVAL_BUFFER_DAYS } from "../constants/requestPolicy.js";

// Deliberately singleton — there is exactly one library, so exactly one
// settings document. Enforced in librarySettingsService (find-or-create
// on first access) rather than a unique index on a constant field, since
// this app has no concurrent-write risk at its scale that would need the
// extra safety of a DB-level constraint.
const librarySettingsSchema = new mongoose.Schema(
  {
    approvalMode: {
      type: String,
      enum: APPROVAL_MODE_VALUES,
      default: APPROVAL_MODE.MANUAL,
    },
    autoApprovalBufferDays: {
      type: Number,
      default: DEFAULT_AUTO_APPROVAL_BUFFER_DAYS,
      min: 0,
      max: 14,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("LibrarySettings", librarySettingsSchema);
