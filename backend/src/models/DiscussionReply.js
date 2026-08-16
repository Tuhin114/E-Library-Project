import mongoose from "mongoose";

// A separate model (rather than a self-referencing parent on
// Discussion) structurally enforces one level of nesting — a reply
// has no way to itself be replied to, so there's no recursive UI or
// sort-by-depth logic to build.
const discussionReplySchema = new mongoose.Schema(
  {
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
  },
  { timestamps: true },
);

const DiscussionReply = mongoose.model("DiscussionReply", discussionReplySchema);

export default DiscussionReply;
