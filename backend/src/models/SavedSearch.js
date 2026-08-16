import mongoose from "mongoose";

// queryParams stores the flat filter object as sent to GET /books
// (search, category, author, sort, ...) so re-running a saved search
// is just a redirect to /books?<queryParams> on the frontend.
const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    queryParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);

export default SavedSearch;
