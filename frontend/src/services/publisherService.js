import * as publisherApi from "../api/publisherApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getPublishers = async () => {
  try {
    const { data } = await publisherApi.fetchPublishers();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPublisherById = async (id) => {
  try {
    const { data } = await publisherApi.fetchPublisherById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getPublisherBySlug = async (slug) => {
  try {
    const { data } = await publisherApi.fetchPublisherBySlug(slug);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createPublisher = async (payload) => {
  try {
    const { data } = await publisherApi.createPublisher(payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updatePublisher = async (id, payload) => {
  try {
    const { data } = await publisherApi.updatePublisher(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deletePublisher = async (id) => {
  try {
    await publisherApi.deletePublisher(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
