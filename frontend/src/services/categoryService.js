import * as categoryApi from "../api/categoryApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getCategories = async () => {
  try {
    const { data } = await categoryApi.fetchCategories();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCategoryById = async (id) => {
  try {
    const { data } = await categoryApi.fetchCategoryById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getCategoryBySlug = async (slug) => {
  try {
    const { data } = await categoryApi.fetchCategoryBySlug(slug);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createCategory = async (payload) => {
  try {
    const { data } = await categoryApi.createCategory(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateCategory = async (id, payload) => {
  try {
    const { data } = await categoryApi.updateCategory(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteCategory = async (id) => {
  try {
    await categoryApi.deleteCategory(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
