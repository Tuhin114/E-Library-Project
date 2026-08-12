import axiosInstance from "./axiosInstance";

const BASE_URL = "/publishers";

export const fetchPublishers = () => axiosInstance.get(BASE_URL);
export const fetchPublisherById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);
export const fetchPublisherBySlug = (slug) =>
  axiosInstance.get(`${BASE_URL}/slug/${slug}`);
export const createPublisher = (payload) =>
  axiosInstance.post(BASE_URL, payload);
export const updatePublisher = (id, payload) =>
  axiosInstance.patch(`${BASE_URL}/${id}`, payload);
export const deletePublisher = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);
