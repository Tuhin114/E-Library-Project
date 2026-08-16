import Discussion from "../models/Discussion.js";
import DiscussionReply from "../models/DiscussionReply.js";
import Book from "../models/Book.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";

const USER_POPULATE = { path: "user", select: "name avatar" };

// A user can delete their own post; a librarian can delete anyone's
// (moderation) — same rule reviewService.deleteReview uses.
const assertCanModerate = (ownerId, requestingUser) => {
  const isOwner = ownerId.toString() === requestingUser._id.toString();
  if (!isOwner && requestingUser.role !== ROLES.LIBRARIAN) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }
};

export const listDiscussionsForBook = async (bookId, query) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [discussions, totalItems] = await Promise.all([
    Discussion.find({ book: bookId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(USER_POPULATE)
      .lean(),
    Discussion.countDocuments({ book: bookId }),
  ]);

  // One query for every reply on this page of discussions, then group
  // in memory — avoids an N+1 query per discussion.
  const discussionIds = discussions.map((discussion) => discussion._id);
  const replies = await DiscussionReply.find({ discussion: { $in: discussionIds } })
    .sort({ createdAt: 1 })
    .populate(USER_POPULATE)
    .lean();

  const repliesByDiscussion = replies.reduce((map, reply) => {
    const key = reply.discussion.toString();
    if (!map[key]) map[key] = [];
    map[key].push(reply);
    return map;
  }, {});

  const withReplies = discussions.map((discussion) => ({
    ...discussion,
    replies: repliesByDiscussion[discussion._id.toString()] || [],
  }));

  return { discussions: withReplies, pagination: buildPaginationMeta({ page, limit, totalItems }) };
};

export const createDiscussion = async (bookId, userId, { message }) => {
  const book = await Book.exists({ _id: bookId });
  if (!book) throw new ApiError(404, "Book not found");

  const discussion = await Discussion.create({ book: bookId, user: userId, message });
  const populated = await discussion.populate(USER_POPULATE);

  return { ...populated.toObject(), replies: [] };
};

export const createReply = async (discussionId, userId, { message }) => {
  const discussion = await Discussion.exists({ _id: discussionId });
  if (!discussion) throw new ApiError(404, "Discussion not found");

  const reply = await DiscussionReply.create({
    discussion: discussionId,
    user: userId,
    message,
  });

  return reply.populate(USER_POPULATE);
};

// Cascade — deleting a discussion removes every reply under it too,
// regardless of who wrote those replies. Same forum-moderation
// convention as deleting a thread taking its comments with it.
export const deleteDiscussion = async (discussionId, requestingUser) => {
  const discussion = await Discussion.findById(discussionId);
  if (!discussion) throw new ApiError(404, "Discussion not found");

  assertCanModerate(discussion.user, requestingUser);

  await Promise.all([
    discussion.deleteOne(),
    DiscussionReply.deleteMany({ discussion: discussionId }),
  ]);
};

export const deleteReply = async (replyId, requestingUser) => {
  const reply = await DiscussionReply.findById(replyId);
  if (!reply) throw new ApiError(404, "Reply not found");

  assertCanModerate(reply.user, requestingUser);

  await reply.deleteOne();
};
