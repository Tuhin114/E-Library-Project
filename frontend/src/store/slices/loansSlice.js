import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as loanService from "../../services/loanService";
import { toast } from "../../hooks/useToast";

const initialState = {
  myLoans: [],
  myLoansStatus: "idle",

  queue: [],
  queueStatus: "idle",
  lastQueueParams: {},

  actionPendingId: null,
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
  async (params = {}, { rejectWithValue }) => {
    try {
      const loans = await loanService.getLoanQueue(params);
      return { loans, params };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// M4 — processing a return. Re-fetches the queue with whatever filter
// the librarian was last on, same pattern requestsSlice uses for
// approve/reject, so the list doesn't silently reset to defaults.
export const returnLoan = createAsyncThunk(
  "loans/return",
  async ({ id, condition, notes }, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await loanService.returnLoan(id, { condition, notes });
      if (result.fee) {
        toast.success(`Returned late — a $${result.fee.amount.toFixed(2)} fee was created`);
      } else {
        toast.success("Return recorded — returned on time");
      }
      dispatch(fetchLoanQueue(getState().loans.lastQueueParams));
      return result;
    } catch (error) {
      toast.error(error.message);
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
        state.queue = action.payload.loans;
        state.lastQueueParams = action.payload.params;
      })
      .addCase(fetchLoanQueue.rejected, (state) => {
        state.queueStatus = "failed";
      })

      .addCase(returnLoan.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.id;
      })
      .addCase(returnLoan.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(returnLoan.rejected, (state) => {
        state.actionPendingId = null;
      });
  },
});

export default loansSlice.reducer;
