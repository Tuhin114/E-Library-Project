import mongoose from "mongoose";
import { BOOK_STATUS, BOOK_STATUS_VALUES } from "../constants/bookStatus.js";
import {
  BOOK_VISIBILITY,
  BOOK_VISIBILITY_VALUES,
} from "../constants/bookVisibility.js";

/**
 * Metadata-only representation of an uploaded digital asset (cover image,
 * PDF, or EPUB). The binary file itself lives in Cloudinary — only the
 * reference/metadata is persisted here.
 */
const fileMetadataSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    format: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    originalName: { type: String, default: "" },
    uploadedAt: { type: Date, default: null },
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
      default: "",
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters"],
      default: "",
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
      default: "English",
    },
    edition: {
      type: String,
      trim: true,
      default: "",
    },
    publicationYear: {
      type: Number,
      min: [1000, "Enter a valid publication year"],
      max: [
        new Date().getFullYear(),
        "Publication year cannot be in the future",
      ],
    },
    numberOfPages: {
      type: Number,
      min: [1, "Number of pages must be at least 1"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    authors: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Author" }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one author is required",
      },
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: [true, "Publisher is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    coverImage: {
      type: fileMetadataSchema,
      default: () => ({}),
    },
    digitalFiles: {
      pdf: { type: fileMetadataSchema, default: () => ({}) },
      epub: { type: fileMetadataSchema, default: () => ({}) },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: BOOK_VISIBILITY_VALUES,
      default: BOOK_VISIBILITY.PUBLIC,
    },
    status: {
      type: String,
      enum: BOOK_STATUS_VALUES,
      default: BOOK_STATUS.DRAFT,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Unique lookup.
bookSchema.index({ isbn: 1 }, { unique: true });

// Exact-match filter fields — every dropdown filter in FilterSidebar hits
// one of these.
bookSchema.index({ category: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ publisher: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ visibility: 1 });
bookSchema.index({ language: 1 });

// Sort fields — every option in FilterSidebar's "Sort By" dropdown hits
// one of these.
bookSchema.index({ createdAt: -1 });
bookSchema.index({ title: 1 });
bookSchema.index({ publicationYear: -1 });
bookSchema.index({ avgRating: -1 });

export default mongoose.model("Book", bookSchema);
