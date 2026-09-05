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

export const fetchAutomationAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/automation`, { params });

export const fetchResourceAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/resources`, { params });

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

export const exportAutomationAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/automation/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });

export const exportResourceAnalytics = (dataset, params = {}) =>
  axiosInstance.get(`${BASE_URL}/resources/export`, {
    params: { dataset, ...params },
    responseType: "blob",
  });
