import * as discussionApi from "../api/discussionApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getBookDiscussions = async (bookId, params = {}) => {
  try {
    const { data } = await discussionApi.fetchBookDiscussions(bookId, params);
    return data.data; // { discussions, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createDiscussion = async (bookId, payload) => {
  try {
    const { data } = await discussionApi.createDiscussion(bookId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not post. Please try again."));
  }
};

export const createReply = async (discussionId, payload) => {
  try {
    const { data } = await discussionApi.createReply(discussionId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not post your reply. Please try again."));
  }
};

export const deleteDiscussion = async (discussionId) => {
  try {
    await discussionApi.deleteDiscussion(discussionId);
    return discussionId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteReply = async (replyId) => {
  try {
    await discussionApi.deleteReply(replyId);
    return replyId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
