import axiosInstance from "./axiosInstance";

const BASE_URL = "/me";

export const fetchProgress = (bookId) =>
  axiosInstance.get(`${BASE_URL}/books/${bookId}/progress`);

export const saveProgress = (bookId, payload) =>
  axiosInstance.put(`${BASE_URL}/books/${bookId}/progress`, payload);

export const fetchBookmarks = (bookId) =>
  axiosInstance.get(`${BASE_URL}/books/${bookId}/bookmarks`);

export const createBookmark = (bookId, payload) =>
  axiosInstance.post(`${BASE_URL}/books/${bookId}/bookmarks`, payload);

export const removeBookmark = (bookmarkId) =>
  axiosInstance.delete(`${BASE_URL}/bookmarks/${bookmarkId}`);
