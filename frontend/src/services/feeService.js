import * as feeApi from "../api/feeApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getMyFees = async (params = {}) => {
  try {
    const { data } = await feeApi.fetchMyFees(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getFeeQueue = async (params = {}) => {
  try {
    const { data } = await feeApi.fetchFeeQueue(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getFeeById = async (id) => {
  try {
    const { data } = await feeApi.fetchFeeById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const payFee = async (id) => {
  try {
    const { data } = await feeApi.payFee(id);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not process this payment. Please try again."),
    );
  }
};
