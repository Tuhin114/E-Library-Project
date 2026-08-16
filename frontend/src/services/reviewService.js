import * as reviewApi from "../api/reviewApi";
import { getErrorMessage } from "../lib/errorHandler";

export const getBookReviews = async (bookId, params = {}) => {
  try {
    const { data } = await reviewApi.fetchBookReviews(bookId, params);
    return data.data; // { reviews, pagination }
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createReview = async (bookId, payload) => {
  try {
    const { data } = await reviewApi.createReview(bookId, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not submit your review. Please try again."),
    );
  }
};

export const updateReview = async (reviewId, payload) => {
  try {
    const { data } = await reviewApi.updateReview(reviewId, payload);
    return data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Could not update your review. Please try again."),
    );
  }
};

export const deleteReview = async (reviewId) => {
  try {
    await reviewApi.deleteReview(reviewId);
    return reviewId;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
