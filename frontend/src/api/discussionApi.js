import axiosInstance from "./axiosInstance";

export const fetchBookDiscussions = (bookId, params = {}) =>
  axiosInstance.get(`/books/${bookId}/discussions`, { params });

export const createDiscussion = (bookId, payload) =>
  axiosInstance.post(`/books/${bookId}/discussions`, payload);

export const createReply = (discussionId, payload) =>
  axiosInstance.post(`/discussions/${discussionId}/replies`, payload);

export const deleteDiscussion = (discussionId) =>
  axiosInstance.delete(`/discussions/${discussionId}`);

export const deleteReply = (replyId) =>
  axiosInstance.delete(`/discussion-replies/${replyId}`);
