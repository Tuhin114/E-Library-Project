import * as loanApi from "../api/loanApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getMyLoans = async (params = {}) => {
  try {
    const { data } = await loanApi.fetchMyLoans(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getLoanQueue = async (params = {}) => {
  try {
    const { data } = await loanApi.fetchLoanQueue(params);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getLoanById = async (id) => {
  try {
    const { data } = await loanApi.fetchLoanById(id);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const collectRequest = async (requestId, payload) => {
  try {
    const { data } = await loanApi.collectRequest(requestId, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not confirm collection. Please try again."),
    );
  }
};
