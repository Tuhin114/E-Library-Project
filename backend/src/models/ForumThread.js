import mongoose from "mongoose";
import { FORUM_CATEGORY_VALUES } from "../constants/forumCategories.js";

const forumThreadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
      maxlength: [5000, "Body cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      enum: FORUM_CATEGORY_VALUES,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Denormalized so the thread list can sort by "most replies" or
    // "latest activity" without a $lookup/aggregate on every request.
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

forumThreadSchema.index({ isPinned: -1, lastActivityAt: -1 });
forumThreadSchema.index({ isPinned: -1, replyCount: -1 });

const ForumThread = mongoose.model("ForumThread", forumThreadSchema);

export default ForumThread;
