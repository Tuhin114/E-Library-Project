import * as savedListApi from "../api/savedListApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getSavedLists = async () => {
  try {
    const { data } = await savedListApi.fetchSavedLists();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getSavedListById = async (listId) => {
  try {
    const { data } = await savedListApi.fetchSavedListById(listId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createSavedList = async (payload) => {
  try {
    const { data } = await savedListApi.createSavedList(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateSavedList = async (listId, payload) => {
  try {
    const { data } = await savedListApi.updateSavedList(listId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteSavedList = async (listId) => {
  try {
    await savedListApi.deleteSavedList(listId);
    return listId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addItemToList = async (listId, resourceId) => {
  try {
    await savedListApi.addItemToList(listId, resourceId);
    return { listId, resourceId };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const removeItemFromList = async (listId, resourceId) => {
  try {
    await savedListApi.removeItemFromList(listId, resourceId);
    return { listId, resourceId };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
