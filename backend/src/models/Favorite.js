import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true },
);

// A user can favorite a given book at most once — enforced at the database
// level, not just in application code, so a race between two rapid clicks
// can't create a duplicate.
favoriteSchema.index({ user: 1, book: 1 }, { unique: true });

// Supports "list my favorites, newest first" without a collection scan.
favoriteSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Favorite", favoriteSchema);
