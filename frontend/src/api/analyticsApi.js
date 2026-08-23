import axiosInstance from "./axiosInstance";

const BASE_URL = "/admin/analytics";

export const fetchCatalogAnalytics = (params = {}) =>
  axiosInstance.get(`${BASE_URL}/catalog`, { params });
