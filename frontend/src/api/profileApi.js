import axiosInstance from "./axiosInstance";

const BASE_URL = "/me";

export const updateProfile = (payload) =>
  axiosInstance.patch(`${BASE_URL}/profile`, payload);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post(`${BASE_URL}/profile/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeAvatar = () =>
  axiosInstance.delete(`${BASE_URL}/profile/avatar`);

export const fetchSavedSearches = () =>
  axiosInstance.get(`${BASE_URL}/saved-searches`);

export const createSavedSearch = (payload) =>
  axiosInstance.post(`${BASE_URL}/saved-searches`, payload);

export const deleteSavedSearch = (id) =>
  axiosInstance.delete(`${BASE_URL}/saved-searches/${id}`);
