import mongoose from "mongoose";

/**
 * A user-titled collection ("Thesis Sources", "Semester 3 Notes"),
 * distinct from the flat Favorite list (Phase 2 M5) — Favorites has no
 * title/grouping, this does. Private-only this milestone: no `visibility`
 * field, no sharing between users. See SavedListItem for the join.
 */
const savedListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Supports "list my saved lists, newest first".
savedListSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("SavedList", savedListSchema);
