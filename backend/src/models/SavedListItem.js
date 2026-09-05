import mongoose from "mongoose";

/**
 * Join collection — a Resource can belong to multiple SavedLists, and a
 * SavedList can hold multiple Resources. `addedBy` is stored directly
 * (rather than derived from `list.owner`) so this doesn't need a join
 * back to SavedList just to answer "who added this" — it's redundant
 * with `list.owner` under this milestone's private-only lists, but
 * keeps the shape stable if a future milestone lets more than one
 * person add to a shared list.
 */
const savedListItemSchema = new mongoose.Schema(
  {
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavedList",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// A resource can only appear once per list — the actual duplicate-add
// guard (DB-level, not just application-level checking), same pattern
// Favorite's (user, book) unique compound index already establishes.
savedListItemSchema.index({ list: 1, resource: 1 }, { unique: true });

// Supports "list this list's items, newest-added first".
savedListItemSchema.index({ list: 1, createdAt: -1 });

export default mongoose.model("SavedListItem", savedListItemSchema);
