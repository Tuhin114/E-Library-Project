import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Publisher name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Publisher name must be at least 2 characters"],
      maxlength: [150, "Publisher name cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

publisherSchema.index({ name: "text" });

export default mongoose.model("Publisher", publisherSchema);
