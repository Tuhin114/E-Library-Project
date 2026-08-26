import axiosInstance from "./axiosInstance";

export const createRequest = (payload) => axiosInstance.post("/requests", payload);

export const fetchMyRequests = (params = {}) =>
  axiosInstance.get("/me/requests", { params });

export const fetchRequestQueue = (params = {}) =>
  axiosInstance.get("/requests", { params });

export const fetchRequestById = (id) => axiosInstance.get(`/requests/${id}`);

export const approveRequest = (id, payload = {}) =>
  axiosInstance.patch(`/requests/${id}/approve`, payload);

export const rejectRequest = (id, payload) =>
  axiosInstance.patch(`/requests/${id}/reject`, payload);

export const cancelRequest = (id) => axiosInstance.patch(`/requests/${id}/cancel`);
