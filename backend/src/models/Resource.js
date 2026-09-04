import mongoose from "mongoose";
import { RESOURCE_TYPE_VALUES } from "../constants/resourceType.js";
import {
  RESOURCE_VISIBILITY,
  RESOURCE_VISIBILITY_VALUES,
} from "../constants/resourceVisibility.js";

/**
 * Metadata-only representation of the uploaded PDF. Same shape as
 * Book's fileMetadataSchema — the binary lives in Cloudinary, only the
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

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    resourceType: {
      type: String,
      enum: RESOURCE_TYPE_VALUES,
      required: [true, "Resource type is required"],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
      default: "",
    },
    // Free text, not a ref to the Author collection — most journal/paper
    // authors won't be registered Authors, and forcing that link would
    // encourage bad data just to satisfy a foreign key.
    authors: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    file: {
      type: fileMetadataSchema,
      default: () => ({}),
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visibility: {
      type: String,
      enum: RESOURCE_VISIBILITY_VALUES,
      default: RESOURCE_VISIBILITY.PRIVATE,
    },
  },
  { timestamps: true },
);

// Supports "list my uploads, newest first" (the ?mine=true path).
resourceSchema.index({ uploadedBy: 1, createdAt: -1 });

// Exact-match filter fields.
resourceSchema.index({ visibility: 1, resourceType: 1 });
resourceSchema.index({ visibility: 1, createdAt: -1 });
resourceSchema.index({ title: 1 });

export default mongoose.model("Resource", resourceSchema);
