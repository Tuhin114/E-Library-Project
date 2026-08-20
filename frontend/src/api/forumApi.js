import axiosInstance from "./axiosInstance";

export const fetchThreads = (params = {}) =>
  axiosInstance.get("/forum/threads", { params });

export const fetchThread = (threadId) =>
  axiosInstance.get(`/forum/threads/${threadId}`);

export const createThread = (payload) =>
  axiosInstance.post("/forum/threads", payload);

export const deleteThread = (threadId) =>
  axiosInstance.delete(`/forum/threads/${threadId}`);

export const toggleThreadLock = (threadId) =>
  axiosInstance.patch(`/forum/threads/${threadId}/lock`);

export const toggleThreadPin = (threadId) =>
  axiosInstance.patch(`/forum/threads/${threadId}/pin`);

export const createReply = (threadId, payload) =>
  axiosInstance.post(`/forum/threads/${threadId}/replies`, payload);

export const deleteReply = (replyId) =>
  axiosInstance.delete(`/forum/replies/${replyId}`);

export const reportThread = (threadId, payload) =>
  axiosInstance.post(`/forum/threads/${threadId}/report`, payload);

export const reportReply = (replyId, payload) =>
  axiosInstance.post(`/forum/replies/${replyId}/report`, payload);

export const fetchReports = () => axiosInstance.get("/forum/reports");

export const resolveReport = (reportId) =>
  axiosInstance.patch(`/forum/reports/${reportId}/resolve`);
