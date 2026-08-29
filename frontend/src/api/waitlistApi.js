import axiosInstance from "./axiosInstance";

export const joinWaitlist = (bookId) => axiosInstance.post(`/books/${bookId}/waitlist`);

export const fetchWaitlistForBook = (bookId) => axiosInstance.get(`/books/${bookId}/waitlist`);

export const fetchMyWaitlist = () => axiosInstance.get("/me/waitlist");

export const leaveWaitlist = (waitlistId) => axiosInstance.delete(`/waitlist/${waitlistId}`);

export const claimWaitlistEntry = (waitlistId, payload = {}) =>
  axiosInstance.patch(`/waitlist/${waitlistId}/claim`, payload);
