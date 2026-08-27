import * as settingsApi from "../api/settingsApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getSettings = async () => {
  try {
    const { data } = await settingsApi.fetchSettings();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateSettings = async (payload) => {
  try {
    const { data } = await settingsApi.updateSettings(payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not update settings. Please try again."),
    );
  }
};
