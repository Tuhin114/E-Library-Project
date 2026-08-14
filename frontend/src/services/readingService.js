import * as readingApi from "../api/readingApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getProgress = async (bookId) => {
  try {
    const { data } = await readingApi.fetchProgress(bookId);
    return data.data; // ReadingProgress | null
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const saveProgress = async (bookId, payload) => {
  try {
    const { data } = await readingApi.saveProgress(bookId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getBookmarks = async (bookId) => {
  try {
    const { data } = await readingApi.fetchBookmarks(bookId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addBookmark = async (bookId, payload) => {
  try {
    const { data } = await readingApi.createBookmark(bookId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteBookmark = async (bookmarkId) => {
  try {
    await readingApi.removeBookmark(bookmarkId);
    return bookmarkId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
