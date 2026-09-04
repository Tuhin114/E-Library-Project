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

// When responseType is "blob", a failed request's JSON error body
// arrives as a Blob, not parsed JSON — same gotcha bookService.js's
// getBlobErrorMessage exists to work around, so 403/404 messages
// actually reach the UI instead of a generic Axios error.
const getBlobErrorMessage = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob && data.type === "application/json") {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || getErrorMessage(error);
    } catch {
      return getErrorMessage(error);
    }
  }
  return getErrorMessage(error);
};

export const getResourceFileBlob = async (id, options = {}) => {
  try {
    const { data } = await resourceApi.fetchResourceFile(id, options);
    return data; // Blob
  } catch (error) {
    throw new Error(await getBlobErrorMessage(error));
  }
};

export const reportResource = async (id, payload) => {
  try {
    const { data } = await resourceApi.reportResource(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
