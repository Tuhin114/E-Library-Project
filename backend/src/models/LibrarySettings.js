import mongoose from "mongoose";
import { APPROVAL_MODE, APPROVAL_MODE_VALUES } from "../constants/approvalMode.js";
import {
  DEFAULT_AUTO_APPROVAL_BUFFER_DAYS,
  DEFAULT_MAX_RENEWALS,
  DEFAULT_RENEWAL_EXTENSION_DAYS,
  DEFAULT_WAITLIST_CLAIM_WINDOW_HOURS,
} from "../constants/requestPolicy.js";

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
    // M2 (Phase 7) — how many times a loan can be renewed before
    // PATCH /loans/:id/renew starts rejecting with "already renewed the
    // maximum number of times".
    maxRenewals: {
      type: Number,
      default: DEFAULT_MAX_RENEWALS,
      min: 0,
      max: 5,
    },
    // M2 (Phase 7) — days added to a loan's dueDate per renewal.
    renewalExtensionDays: {
      type: Number,
      default: DEFAULT_RENEWAL_EXTENSION_DAYS,
      min: 1,
      max: 30,
    },
    // M2 (Phase 7) — how long a notified waitlist entry's reserved copy
    // stays held before the expiry job releases it back and cascades to
    // the next person in line.
    waitlistClaimWindowHours: {
      type: Number,
      default: DEFAULT_WAITLIST_CLAIM_WINDOW_HOURS,
      min: 1,
      max: 168,
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
