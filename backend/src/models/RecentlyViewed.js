import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }, // viewedAt IS the timestamp we care about; no need for createdAt/updatedAt too
);

// One entry per (user, book) — viewing the same book again updates
// `viewedAt` via upsert in userLibraryService rather than creating a
// duplicate row. Also supports "list my recently viewed, most recent first".
recentlyViewedSchema.index({ user: 1, book: 1 }, { unique: true });
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

export default mongoose.model("RecentlyViewed", recentlyViewedSchema);
