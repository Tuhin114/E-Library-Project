import * as authorApi from "../api/authorApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getAuthors = async () => {
  try {
    const { data } = await authorApi.fetchAuthors();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAuthorById = async (id) => {
  try {
    const { data } = await authorApi.fetchAuthorById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getAuthorBySlug = async (slug) => {
  try {
    const { data } = await authorApi.fetchAuthorBySlug(slug);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createAuthor = async (payload) => {
  try {
    const { data } = await authorApi.createAuthor(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateAuthor = async (id, payload) => {
  try {
    const { data } = await authorApi.updateAuthor(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteAuthor = async (id) => {
  try {
    await authorApi.deleteAuthor(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
