import axiosInstance from "./axiosInstance";

const BASE_URL = "/admin/analytics";

export const fetchCatalogAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/catalog`, { params });

export const fetchEngagementAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/engagement`, { params });

export const fetchModerationAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/moderation`, { params });
