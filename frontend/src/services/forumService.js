import * as forumApi from "../api/forumApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getThreads = async (params = {}) => {
  try {
    const { data } = await forumApi.fetchThreads(params);
    return data.data; // { threads, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getThread = async (threadId) => {
  try {
    const { data } = await forumApi.fetchThread(threadId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createThread = async (payload) => {
  try {
    const { data } = await forumApi.createThread(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not post your thread. Please try again."));
  }
};

export const deleteThread = async (threadId) => {
  try {
    await forumApi.deleteThread(threadId);
    return threadId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const toggleThreadLock = async (threadId) => {
  try {
    const { data } = await forumApi.toggleThreadLock(threadId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const toggleThreadPin = async (threadId) => {
  try {
    const { data } = await forumApi.toggleThreadPin(threadId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createReply = async (threadId, payload) => {
  try {
    const { data } = await forumApi.createReply(threadId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not post your reply. Please try again."));
  }
};

export const deleteReply = async (replyId) => {
  try {
    await forumApi.deleteReply(replyId);
    return replyId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const reportThread = async (threadId, payload) => {
  try {
    const { data } = await forumApi.reportThread(threadId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not submit your report. Please try again."));
  }
};

export const reportReply = async (replyId, payload) => {
  try {
    const { data } = await forumApi.reportReply(replyId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not submit your report. Please try again."));
  }
};

export const getReports = async () => {
  try {
    const { data } = await forumApi.fetchReports();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const resolveReport = async (reportId) => {
  try {
    const { data } = await forumApi.resolveReport(reportId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
