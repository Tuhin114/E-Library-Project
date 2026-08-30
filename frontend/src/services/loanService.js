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

export const returnLoan = async (loanId, payload) => {
  try {
    const { data } = await loanApi.returnLoan(loanId, payload);
    return data.data; // { loan, fee }
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not record this return. Please try again."),
    );
  }
};

export const renewLoan = async (loanId) => {
  try {
    const { data } = await loanApi.renewLoan(loanId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not renew this loan. Please try again."));
  }
};

export const reportLoanLost = async (loanId, payload) => {
  try {
    const { data } = await loanApi.reportLoanLost(loanId, payload);
    return data.data; // { loan, fee }
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not report this loan lost. Please try again."),
    );
  }
};
