import axiosInstance from "./axiosInstance";

export const fetchMyLoans = (params = {}) => axiosInstance.get("/me/loans", { params });

export const fetchLoanQueue = (params = {}) => axiosInstance.get("/loans", { params });

export const fetchLoanById = (id) => axiosInstance.get(`/loans/${id}`);

export const collectRequest = (requestId, payload = {}) =>
  axiosInstance.patch(`/requests/${requestId}/collect`, payload);

export const returnLoan = (loanId, payload) =>
  axiosInstance.patch(`/loans/${loanId}/return`, payload);

export const renewLoan = (loanId) => axiosInstance.patch(`/loans/${loanId}/renew`);
