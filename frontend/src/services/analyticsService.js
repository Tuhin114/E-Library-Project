import * as analyticsApi from "../api/analyticsApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getCatalogAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchCatalogAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not load catalog analytics."),
    );
  }
};

export const getEngagementAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchEngagementAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not load engagement analytics."),
    );
  }
};

export const getModerationAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchModerationAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not load moderation analytics."),
    );
  }
};

export const getCirculationAnalytics = async (params = {}) => {
  try {
    const { data } = await analyticsApi.fetchCirculationAnalytics(params);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not load circulation analytics."),
    );
  }
};

export const exportCatalogAnalytics = async (dataset, params = {}) => {
  try {
    const response = await analyticsApi.exportCatalogAnalytics(dataset, params);

    const contentDisposition = response.headers["content-disposition"];
    const filename =
      contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ||
      `catalog-${dataset}.csv`;

    return {
      blob: response.data,
      filename,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not export catalog analytics."),
    );
  }
};

export const exportEngagementAnalytics = async (dataset, params = {}) => {
  try {
    const response = await analyticsApi.exportEngagementAnalytics(
      dataset,
      params,
    );

    const contentDisposition = response.headers["content-disposition"];
    const filename =
      contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ||
      `engagement-${dataset}.csv`;

    return {
      blob: response.data,
      filename,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not export engagement analytics."),
    );
  }
};

export const exportModerationAnalytics = async (dataset, params = {}) => {
  try {
    const response = await analyticsApi.exportModerationAnalytics(
      dataset,
      params,
    );

    const contentDisposition = response.headers["content-disposition"];
    const filename =
      contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ||
      `moderation-${dataset}.csv`;

    return {
      blob: response.data,
      filename,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not export moderation analytics."),
    );
  }
};

export const exportCirculationAnalytics = async (dataset, params = {}) => {
  try {
    const response = await analyticsApi.exportCirculationAnalytics(
      dataset,
      params,
    );

    const contentDisposition = response.headers["content-disposition"];
    const filename =
      contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] ||
      `circulation-${dataset}.csv`;

    return {
      blob: response.data,
      filename,
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not export circulation analytics."),
    );
  }
};
