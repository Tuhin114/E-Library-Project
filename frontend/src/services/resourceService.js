import * as resourceApi from "../api/resourceApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getResources = async (params = {}) => {
  try {
    const { data } = await resourceApi.fetchResources(params);
    return data.data; // { resources, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getResourceById = async (id) => {
  try {
    const { data } = await resourceApi.fetchResourceById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createResource = async (payload) => {
  try {
    const { data } = await resourceApi.createResource(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateResource = async (id, payload) => {
  try {
    const { data } = await resourceApi.updateResource(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteResource = async (id) => {
  try {
    await resourceApi.deleteResource(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadResourceFile = async (id, file) => {
  try {
    const { data } = await resourceApi.uploadResourceFile(id, file);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteResourceFile = async (id) => {
  try {
    const { data } = await resourceApi.deleteResourceFile(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
