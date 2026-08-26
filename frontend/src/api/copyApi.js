import axiosInstance from "./axiosInstance";

export const fetchCopies = (bookId, params = {}) =>
  axiosInstance.get(`/books/${bookId}/copies`, { params });

export const fetchInventorySummary = (bookId) =>
  axiosInstance.get(`/books/${bookId}/inventory`);

export const addCopies = (bookId, payload) =>
  axiosInstance.post(`/books/${bookId}/copies`, payload);

export const updateCopy = (copyId, payload) =>
  axiosInstance.patch(`/copies/${copyId}`, payload);

export const deleteCopy = (copyId) =>
  axiosInstance.delete(`/copies/${copyId}`);
