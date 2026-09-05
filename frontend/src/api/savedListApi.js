import axiosInstance from "./axiosInstance";

const BASE_URL = "/me/saved-lists";

export const fetchSavedLists = () => axiosInstance.get(BASE_URL);
export const fetchSavedListById = (listId) =>
  axiosInstance.get(`${BASE_URL}/${listId}`);
export const createSavedList = (payload) =>
  axiosInstance.post(BASE_URL, payload);
export const updateSavedList = (listId, payload) =>
  axiosInstance.patch(`${BASE_URL}/${listId}`, payload);
export const deleteSavedList = (listId) =>
  axiosInstance.delete(`${BASE_URL}/${listId}`);

export const addItemToList = (listId, resourceId) =>
  axiosInstance.post(`${BASE_URL}/${listId}/items/${resourceId}`);
export const removeItemFromList = (listId, resourceId) =>
  axiosInstance.delete(`${BASE_URL}/${listId}/items/${resourceId}`);
