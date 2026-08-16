import * as profileApi from "../api/profileApi";
import { getErrorMessage } from "../lib/errorHandler";

export const updateProfile = async (payload) => {
  try {
    const { data } = await profileApi.updateProfile(payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not update profile. Please try again."),
    );
  }
};

export const uploadAvatar = async (file) => {
  try {
    const { data } = await profileApi.uploadAvatar(file);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not upload avatar. Please try again."),
    );
  }
};

export const removeAvatar = async () => {
  try {
    const { data } = await profileApi.removeAvatar();
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not remove avatar. Please try again."),
    );
  }
};

export const getSavedSearches = async () => {
  try {
    const { data } = await profileApi.fetchSavedSearches();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const saveSearch = async (payload) => {
  try {
    const { data } = await profileApi.createSavedSearch(payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not save this search. Please try again."),
    );
  }
};

export const deleteSavedSearch = async (id) => {
  try {
    await profileApi.deleteSavedSearch(id);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
