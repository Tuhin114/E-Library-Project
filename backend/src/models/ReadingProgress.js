import mongoose from "mongoose";

const readingProgressSchema = new mongoose.Schema(
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
    // Page number (PDF) or EPUB CFI, always stored as a string.
    location: {
      type: String,
      required: true,
      trim: true,
    },
    percentComplete: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }, // lastReadAt IS the timestamp we care about
);

// One progress row per (user, book) — re-reading the same book updates
// this row via upsert (see readingService.upsertProgress) rather than
// creating a duplicate. Also supports "list this user's in-progress
// books, most recently read first" for Continue Reading.
readingProgressSchema.index({ user: 1, book: 1 }, { unique: true });
readingProgressSchema.index({ user: 1, lastReadAt: -1 });

export default mongoose.model("ReadingProgress", readingProgressSchema);
