import * as copyApi from "../api/copyApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getCopies = async (bookId, params = {}) => {
  try {
    const { data } = await copyApi.fetchCopies(bookId, params);
    return data.data; // array of copies
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getInventorySummary = async (bookId) => {
  try {
    const { data } = await copyApi.fetchInventorySummary(bookId);
    return data.data; // { bookId, totalCopies, breakdown }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addCopies = async (bookId, payload) => {
  try {
    const { data } = await copyApi.addCopies(bookId, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not add copies. Please try again."),
    );
  }
};

export const updateCopy = async (copyId, payload) => {
  try {
    const { data } = await copyApi.updateCopy(copyId, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not update this copy. Please try again."),
    );
  }
};

export const deleteCopy = async (copyId) => {
  try {
    await copyApi.deleteCopy(copyId);
    return copyId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
