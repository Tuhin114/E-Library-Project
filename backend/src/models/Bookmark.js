import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    format: {
      type: String,
      enum: ["pdf", "epub"],
      required: true,
    },
    // Page number (PDF) or EPUB CFI, always stored as a string — the
    // two formats have nothing else in common to normalize around.
    location: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true },
);

// Supports "list this user's bookmarks for this book, newest first".
bookmarkSchema.index({ user: 1, book: 1, createdAt: -1 });

export default mongoose.model("Bookmark", bookmarkSchema);
