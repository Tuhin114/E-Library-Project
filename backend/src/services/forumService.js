import ForumThread from "../models/ForumThread.js";
import ForumReply from "../models/ForumReply.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { getPaginationParams, buildPaginationMeta } from "../utils/paginate.js";

const USER_POPULATE = { path: "user", select: "name avatar" };

// Pinned threads always sort first; the requested sort mode only
// decides ordering within each of those two groups.
const SORT_STAGES = {
  latest: { isPinned: -1, lastActivityAt: -1 },
  most_replies: { isPinned: -1, replyCount: -1 },
  unanswered: { isPinned: -1, createdAt: -1 },
};

const assertCanModerate = (ownerId, requestingUser) => {
  const isOwner = ownerId.toString() === requestingUser._id.toString();
  if (!isOwner && requestingUser.role !== ROLES.LIBRARIAN) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
};

export const listThreads = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const sortKey = query.sort && SORT_STAGES[query.sort] ? query.sort : "latest";
  const filter = {};

  if (query.category) filter.category = query.category;
  if (sortKey === "unanswered") filter.replyCount = 0;

  const [threads, totalItems] = await Promise.all([
    ForumThread.find(filter)
      .sort(SORT_STAGES[sortKey])
      .skip(skip)
      .limit(limit)
      .populate(USER_POPULATE)
      .lean(),
    ForumThread.countDocuments(filter),
  ]);

  return { threads, pagination: buildPaginationMeta({ page, limit, totalItems }) };
};

export const getThreadWithReplies = async (threadId) => {
  const thread = await ForumThread.findById(threadId).populate(USER_POPULATE).lean();
  if (!thread) throw new ApiError(404, "Thread not found");

  const replies = await ForumReply.find({ thread: threadId })
    .sort({ createdAt: 1 })
    .populate(USER_POPULATE)
    .lean();

  return { ...thread, replies };
};

export const createThread = async (userId, { title, body, category }) => {
  const thread = await ForumThread.create({ title, body, category, user: userId });
  const populated = await thread.populate(USER_POPULATE);

  return { ...populated.toObject(), replies: [] };
};

export const createReply = async (threadId, userId, { message }) => {
  const thread = await ForumThread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");
  if (thread.isLocked) throw new ApiError(403, "This thread is locked and no longer accepting replies");

  const reply = await ForumReply.create({ thread: threadId, user: userId, message });

  thread.replyCount += 1;
  thread.lastActivityAt = new Date();
  await thread.save();

  return reply.populate(USER_POPULATE);
};

// Cascade — deleting a thread removes every reply under it, same
// convention as the per-book discussion feature.
export const deleteThread = async (threadId, requestingUser) => {
  const thread = await ForumThread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  assertCanModerate(thread.user, requestingUser);

  await Promise.all([
    thread.deleteOne(),
    ForumReply.deleteMany({ thread: threadId }),
  ]);
};

export const deleteReply = async (replyId, requestingUser) => {
  const reply = await ForumReply.findById(replyId);
  if (!reply) throw new ApiError(404, "Reply not found");

  assertCanModerate(reply.user, requestingUser);

  await reply.deleteOne();
  await ForumThread.findByIdAndUpdate(reply.thread, { $inc: { replyCount: -1 } });
};

// Toggle rather than take an explicit boolean — the caller (a
// librarian looking at the thread) just wants "flip it", and a toggle
// endpoint needs no request body or validator.
export const toggleThreadLock = async (threadId) => {
  const thread = await ForumThread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  thread.isLocked = !thread.isLocked;
  await thread.save();

  return thread.populate(USER_POPULATE);
};

export const toggleThreadPin = async (threadId) => {
  const thread = await ForumThread.findById(threadId);
  if (!thread) throw new ApiError(404, "Thread not found");

  thread.isPinned = !thread.isPinned;
  await thread.save();

  return thread.populate(USER_POPULATE);
};
