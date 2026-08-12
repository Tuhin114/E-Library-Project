import axiosInstance from "./axiosInstance";

const BASE_URL = "/me";

export const fetchFavorites = () => axiosInstance.get(`${BASE_URL}/favorites`);
export const addFavorite = (bookId) =>
  axiosInstance.post(`${BASE_URL}/favorites/${bookId}`);
export const removeFavorite = (bookId) =>
  axiosInstance.delete(`${BASE_URL}/favorites/${bookId}`);
export const fetchRecentlyViewed = () =>
  axiosInstance.get(`${BASE_URL}/recently-viewed`);
