import * as libraryApi from "../api/libraryApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getFavorites = async () => {
  try {
    const { data } = await libraryApi.fetchFavorites();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addFavorite = async (bookId) => {
  try {
    await libraryApi.addFavorite(bookId);
    return bookId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeFavorite = async (bookId) => {
  try {
    await libraryApi.removeFavorite(bookId);
    return bookId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getRecentlyViewed = async () => {
  try {
    const { data } = await libraryApi.fetchRecentlyViewed();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
