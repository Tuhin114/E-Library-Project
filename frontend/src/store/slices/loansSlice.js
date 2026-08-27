import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as loanService from "../../services/loanService";

const initialState = {
  myLoans: [],
  myLoansStatus: "idle",

  queue: [],
  queueStatus: "idle",
};

export const fetchMyLoans = createAsyncThunk(
  "loans/fetchMine",
  async (params, { rejectWithValue }) => {
    try {
      return await loanService.getMyLoans(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchLoanQueue = createAsyncThunk(
  "loans/fetchQueue",
  async (params, { rejectWithValue }) => {
    try {
      return await loanService.getLoanQueue(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const loansSlice = createSlice({
  name: "loans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLoans.pending, (state) => {
        state.myLoansStatus = "loading";
      })
      .addCase(fetchMyLoans.fulfilled, (state, action) => {
        state.myLoansStatus = "succeeded";
        state.myLoans = action.payload;
      })
      .addCase(fetchMyLoans.rejected, (state) => {
        state.myLoansStatus = "failed";
      })

      .addCase(fetchLoanQueue.pending, (state) => {
        state.queueStatus = "loading";
      })
      .addCase(fetchLoanQueue.fulfilled, (state, action) => {
        state.queueStatus = "succeeded";
        state.queue = action.payload;
      })
      .addCase(fetchLoanQueue.rejected, (state) => {
        state.queueStatus = "failed";
      });
  },
});

export default loansSlice.reducer;
