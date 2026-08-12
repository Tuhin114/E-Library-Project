import axiosInstance from "./axiosInstance";

const BASE_URL = "/categories";

export const fetchCategories = () => axiosInstance.get(BASE_URL);
export const fetchCategoryById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);
export const fetchCategoryBySlug = (slug) =>
  axiosInstance.get(`${BASE_URL}/slug/${slug}`);
export const createCategory = (payload) =>
  axiosInstance.post(BASE_URL, payload);
export const updateCategory = (id, payload) =>
  axiosInstance.patch(`${BASE_URL}/${id}`, payload);
export const deleteCategory = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);
