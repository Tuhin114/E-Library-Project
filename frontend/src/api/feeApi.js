import axiosInstance from "./axiosInstance";

export const fetchMyFees = (params = {}) => axiosInstance.get("/me/fees", { params });

export const fetchFeeQueue = (params = {}) => axiosInstance.get("/fees", { params });

export const fetchFeeById = (id) => axiosInstance.get(`/fees/${id}`);

export const payFee = (id) => axiosInstance.patch(`/fees/${id}/pay`);

export const finalizeFee = (id, payload = {}) =>
  axiosInstance.patch(`/fees/${id}/finalize`, payload);

export const waiveFee = (id, payload) => axiosInstance.patch(`/fees/${id}/waive`, payload);
