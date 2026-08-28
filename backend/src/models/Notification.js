import mongoose from "mongoose";
import {
  NOTIFICATION_CATEGORY_VALUES,
  DELIVERY_CHANNEL_VALUES,
} from "../constants/notificationTypes.js";

// Polymorphic pointer back to whatever triggered this notification
// (a PhysicalRequest, a ForumThread, a ForumReport, ...) — same
// { kind, id } pattern ForumReport already uses for its own
// polymorphic targetType/targetId, kept consistent rather than
// inventing a new shape.
const relatedEntitySchema = new mongoose.Schema(
  {
    kind: { type: String, default: null },
    id: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: false },
);

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORY_VALUES,
      required: true,
    },
    // Free-text, not enum-constrained — new types (M2's waitlist
    // events, M3's fee events) are added by other services calling
    // notify() with a new string, no schema change required.
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    relatedEntity: {
      type: relatedEntitySchema,
      default: () => ({}),
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Which channels this specific notification actually went out on —
    // set by notificationService.notify() after checking the user's
    // preferences, so the bell/list can honestly reflect "this one was
    // also emailed" rather than assuming every notification is emailed.
    deliveredVia: {
      type: [String],
      enum: DELIVERY_CHANNEL_VALUES,
      default: [],
    },
  },
  { timestamps: true },
);

// Drives both the paginated feed (newest first) and the unread-count
// query without a collection scan.
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
