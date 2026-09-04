import axiosInstance from "./axiosInstance";

const BASE_URL = "/resources";

export const fetchResources = (params = {}) =>
  axiosInstance.get(BASE_URL, { params });
export const fetchResourceById = (id) =>
  axiosInstance.get(`${BASE_URL}/${id}`);
export const createResource = (payload) =>
  axiosInstance.post(BASE_URL, payload);
export const updateResource = (id, payload) =>
  axiosInstance.patch(`${BASE_URL}/${id}`, payload);
export const deleteResource = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}`);

export const uploadResourceFile = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`${BASE_URL}/${id}/file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteResourceFile = (id) =>
  axiosInstance.delete(`${BASE_URL}/${id}/file`);
