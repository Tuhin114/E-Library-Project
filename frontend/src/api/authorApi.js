import axiosInstance from "./axiosInstance";

const BASE_URL = "/authors";

export const fetchAuthors = () => axiosInstance.get(BASE_URL);
export const fetchAuthorById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);
export const fetchAuthorBySlug = (slug) =>
  axiosInstance.get(`${BASE_URL}/slug/${slug}`);
export const createAuthor = (payload) => axiosInstance.post(BASE_URL, payload);
export const updateAuthor = (id, payload) =>
  axiosInstance.patch(`${BASE_URL}/${id}`, payload);
export const deleteAuthor = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);
