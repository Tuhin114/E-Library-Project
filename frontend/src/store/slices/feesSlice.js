import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as feeService from "../../services/feeService";
import { toast } from "../../hooks/useToast";

const initialState = {
  myFees: [],
  myFeesStatus: "idle",

  queue: [],
  queueStatus: "idle",
  lastQueueParams: {},

  actionPendingId: null,
};

export const fetchMyFees = createAsyncThunk(
  "fees/fetchMine",
  async (params, { rejectWithValue }) => {
    try {
      return await feeService.getMyFees(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchFeeQueue = createAsyncThunk(
  "fees/fetchQueue",
  async (params = {}, { rejectWithValue }) => {
    try {
      const fees = await feeService.getFeeQueue(params);
      return { fees, params };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const payFee = createAsyncThunk(
  "fees/pay",
  async (id, { dispatch, getState, rejectWithValue }) => {
    try {
      const fee = await feeService.payFee(id);
      toast.success(`Payment recorded — receipt ${fee.receiptReference}`);
      // Only one of these lists will actually be populated depending on
      // who's calling (student vs librarian), but re-fetching both is
      // harmless and keeps whichever view is open in sync.
      dispatch(fetchMyFees());
      dispatch(fetchFeeQueue(getState().fees.lastQueueParams));
      return fee;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

// M3 (Phase 7) — confirms/adjusts a PENDING_REVIEW fee, moving it to
// OUTSTANDING. Re-fetches the librarian queue on success since the
// fee's status bucket changed (it may drop out of whichever filtered
// view is currently open).
export const finalizeFee = createAsyncThunk(
  "fees/finalize",
  async ({ id, amount }, { dispatch, getState, rejectWithValue }) => {
    try {
      const fee = await feeService.finalizeFee(id, amount !== undefined ? { amount } : {});
      toast.success("Fee finalized — the student has been notified");
      dispatch(fetchFeeQueue(getState().fees.lastQueueParams));
      return fee;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

// M3 (Phase 7) — waives a fee outright (from PENDING_REVIEW or
// OUTSTANDING). Re-fetches both lists, same reasoning as payFee.
export const waiveFee = createAsyncThunk(
  "fees/waive",
  async ({ id, reason }, { dispatch, getState, rejectWithValue }) => {
    try {
      const fee = await feeService.waiveFee(id, { reason });
      toast.success("Fee waived");
      dispatch(fetchMyFees());
      dispatch(fetchFeeQueue(getState().fees.lastQueueParams));
      return fee;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyFees.pending, (state) => {
        state.myFeesStatus = "loading";
      })
      .addCase(fetchMyFees.fulfilled, (state, action) => {
        state.myFeesStatus = "succeeded";
        state.myFees = action.payload;
      })
      .addCase(fetchMyFees.rejected, (state) => {
        state.myFeesStatus = "failed";
      })

      .addCase(fetchFeeQueue.pending, (state) => {
        state.queueStatus = "loading";
      })
      .addCase(fetchFeeQueue.fulfilled, (state, action) => {
        state.queueStatus = "succeeded";
        state.queue = action.payload.fees;
        state.lastQueueParams = action.payload.params;
      })
      .addCase(fetchFeeQueue.rejected, (state) => {
        state.queueStatus = "failed";
      })

      .addCase(payFee.pending, (state, action) => {
        state.actionPendingId = action.meta.arg;
      })
      .addCase(payFee.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(payFee.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(finalizeFee.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.id;
      })
      .addCase(finalizeFee.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(finalizeFee.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(waiveFee.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.id;
      })
      .addCase(waiveFee.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(waiveFee.rejected, (state) => {
        state.actionPendingId = null;
      });
  },
});

export default feesSlice.reducer;
