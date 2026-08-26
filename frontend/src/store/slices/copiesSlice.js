import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as copyService from "../../services/copyService";
import { fetchBookById } from "./booksSlice";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  summary: null,
  status: "idle",
  error: null,
};

export const fetchCopies = createAsyncThunk(
  "copies/fetchForBook",
  async (bookId, { rejectWithValue }) => {
    try {
      const [items, summary] = await Promise.all([
        copyService.getCopies(bookId),
        copyService.getInventorySummary(bookId),
      ]);
      return { items, summary };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// physicalCopiesTotal/Available live on the Book document — re-fetching
// the book after every mutation keeps that summary (and the student-
// facing availability badge on BookDetails) in sync, same reasoning
// reviewsSlice uses for avgRating/reviewCount.
export const addCopies = createAsyncThunk(
  "copies/add",
  async ({ bookId, payload }, { dispatch, rejectWithValue }) => {
    try {
      const copies = await copyService.addCopies(bookId, payload);
      await dispatch(fetchCopies(bookId));
      dispatch(fetchBookById(bookId));
      toast.success(`${copies.length} ${copies.length === 1 ? "copy" : "copies"} added`);
      return copies;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const editCopy = createAsyncThunk(
  "copies/edit",
  async ({ copyId, bookId, payload }, { dispatch, rejectWithValue }) => {
    try {
      const copy = await copyService.updateCopy(copyId, payload);
      await dispatch(fetchCopies(bookId));
      dispatch(fetchBookById(bookId));
      toast.success("Copy updated");
      return copy;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const removeCopy = createAsyncThunk(
  "copies/remove",
  async ({ copyId, bookId }, { dispatch, rejectWithValue }) => {
    try {
      await copyService.deleteCopy(copyId);
      await dispatch(fetchCopies(bookId));
      dispatch(fetchBookById(bookId));
      toast.success("Copy removed");
      return copyId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const copiesSlice = createSlice({
  name: "copies",
  initialState,
  reducers: {
    clearCopies(state) {
      state.items = [];
      state.summary = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCopies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCopies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.summary = action.payload.summary;
      })
      .addCase(fetchCopies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCopies } = copiesSlice.actions;
export default copiesSlice.reducer;
