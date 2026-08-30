import axiosInstance from "./axiosInstance";

const BASE_URL = "/admin/analytics";

export const fetchCatalogAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/catalog`, { params });

export const fetchEngagementAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/engagement`, { params });

export const fetchModerationAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/moderation`, { params });

export const fetchCirculationAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/circulation`, { params });

export const fetchFinancialAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/financial`, { params });

export const exportCatalogAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/catalog/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });

export const exportEngagementAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/engagement/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });

export const exportModerationAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/moderation/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });

export const exportCirculationAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/circulation/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });

export const exportFinancialAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/financial/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });
