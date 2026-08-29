import * as waitlistApi from "../api/waitlistApi";
import { getErrorMessage } from "../lib/errorHandler";

export const joinWaitlist = async (bookId) => {
  try {
    const { data } = await waitlistApi.joinWaitlist(bookId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not join the waitlist. Please try again."));
  }
};

export const getWaitlistForBook = async (bookId) => {
  try {
    const { data } = await waitlistApi.fetchWaitlistForBook(bookId);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getMyWaitlist = async () => {
  try {
    const { data } = await waitlistApi.fetchMyWaitlist();
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const leaveWaitlist = async (waitlistId) => {
  try {
    await waitlistApi.leaveWaitlist(waitlistId);
    return waitlistId;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not leave the waitlist. Please try again."));
  }
};

export const claimWaitlistEntry = async (waitlistId, payload) => {
  try {
    const { data } = await waitlistApi.claimWaitlistEntry(waitlistId, payload);
    return data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Could not claim this hold. Please try again."));
  }
};
