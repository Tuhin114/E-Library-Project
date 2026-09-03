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

export const finalizeFee = async (id, payload) => {
  try {
    const { data } = await feeApi.finalizeFee(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not finalize this fee. Please try again."));
  }
};

export const waiveFee = async (id, payload) => {
  try {
    const { data } = await feeApi.waiveFee(id, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not waive this fee. Please try again."));
  }
};

export const getFeeReceipt = async (id) => {
  try {
    const response = await feeApi.fetchFeeReceipt(id);
    const contentDisposition = response.headers["content-disposition"];
    const filename =
      contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1] || `payment-receipt-${id}.pdf`;
    return { blob: response.data, filename };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not download this receipt."));
  }
};

export const checkoutFee = async (id) => {
  try {
    const { data } = await feeApi.checkoutFee(id);
    return data.data; // { paymentLinkId, url }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not start checkout. Please try again."));
  }
};
