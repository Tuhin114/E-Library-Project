import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewService from "../../services/reviewService";
import { fetchBookById } from "./booksSlice";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchReviews = createAsyncThunk(
  "reviews/fetchForBook",
  async (bookId, { rejectWithValue }) => {
    try {
      return await reviewService.getBookReviews(bookId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// avgRating/reviewCount live on the Book document, not the review
// response — re-fetching the book after every mutation keeps
// BookDetails' rating summary in sync without a second round-trip
// shape to maintain.
export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ bookId, payload }, { dispatch, rejectWithValue }) => {
    try {
      const review = await reviewService.createReview(bookId, payload);
      dispatch(fetchBookById(bookId));
      toast.success("Review submitted");
      return review;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const editReview = createAsyncThunk(
  "reviews/edit",
  async ({ reviewId, bookId, payload }, { dispatch, rejectWithValue }) => {
    try {
      const review = await reviewService.updateReview(reviewId, payload);
      dispatch(fetchBookById(bookId));
      toast.success("Review updated");
      return review;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const removeReview = createAsyncThunk(
  "reviews/remove",
  async ({ reviewId, bookId }, { dispatch, rejectWithValue }) => {
    try {
      await reviewService.deleteReview(reviewId);
      dispatch(fetchBookById(bookId));
      toast.success("Review deleted");
      return reviewId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviews(state) {
      state.items = [];
      state.pagination = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editReview.fulfilled, (state, action) => {
        const index = state.items.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      });
  },
});

export const { clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
