import * as requestApi from "../api/requestApi";
import { getErrorMessage } from "../lib/errorHandler";

export const createRequest = async (payload) => {
  try {
    const { data } = await requestApi.createRequest(payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not submit your request. Please try again."),
    );
  }
};

export const getMyRequests = async (params = {}) => {
  try {
    const { data } = await requestApi.fetchMyRequests(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getRequestQueue = async (params = {}) => {
  try {
    const { data } = await requestApi.fetchRequestQueue(params);
    return data.data; // { requests, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getRequestById = async (id) => {
  try {
    const { data } = await requestApi.fetchRequestById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const approveRequest = async (id, payload) => {
  try {
    const { data } = await requestApi.approveRequest(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not approve this request. Please try again."),
    );
  }
};

export const rejectRequest = async (id, payload) => {
  try {
    const { data } = await requestApi.rejectRequest(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not reject this request. Please try again."),
    );
  }
};

export const cancelRequest = async (id) => {
  try {
    const { data } = await requestApi.cancelRequest(id);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not cancel this request. Please try again."),
    );
  }
};
