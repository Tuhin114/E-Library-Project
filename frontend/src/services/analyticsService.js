import * as analyticsApi from "../api/analyticsApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getCatalogAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchCatalogAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not load catalog analytics."));
  }
};

export const getEngagementAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchEngagementAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not load engagement analytics."));
  }
};

export const getModerationAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchModerationAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not load moderation analytics."));
  }
};
