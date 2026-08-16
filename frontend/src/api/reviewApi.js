import axiosInstance from "./axiosInstance";

export const fetchBookReviews = (bookId, params = {}) =>
  axiosInstance.get(`/books/${bookId}/reviews`, { params });

export const createReview = (bookId, payload) =>
  axiosInstance.post(`/books/${bookId}/reviews`, payload);

export const updateReview = (reviewId, payload) =>
  axiosInstance.patch(`/reviews/${reviewId}`, payload);

export const deleteReview = (reviewId) =>
  axiosInstance.delete(`/reviews/${reviewId}`);
