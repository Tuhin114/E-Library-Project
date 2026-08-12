import * as bookApi from "../api/bookApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getBooks = async (params = {}) => {
  try {
    const { data } = await bookApi.fetchBooks(params);
    return data.data; // { books, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getBookById = async (id) => {
  try {
    const { data } = await bookApi.fetchBookById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createBook = async (payload) => {
  try {
    const { data } = await bookApi.createBook(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateBook = async (id, payload) => {
  try {
    const { data } = await bookApi.updateBook(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteBook = async (id) => {
  try {
    await bookApi.deleteBook(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadCoverImage = async (id, file) => {
  try {
    const { data } = await bookApi.uploadCoverImage(id, file);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteCoverImage = async (id) => {
  try {
    const { data } = await bookApi.deleteCoverImage(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadDigitalFile = async (id, type, file) => {
  try {
    const { data } = await bookApi.uploadDigitalFile(id, type, file);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteDigitalFile = async (id, type) => {
  try {
    const { data } = await bookApi.deleteDigitalFile(id, type);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
