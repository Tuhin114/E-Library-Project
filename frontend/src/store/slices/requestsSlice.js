import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as requestService from "../../services/requestService";
import { fetchBookById } from "./booksSlice";
import { toast } from "../../hooks/useToast";

const initialState = {
  myRequests: [],
  myRequestsStatus: "idle",

  queue: [],
  queuePagination: null,
  queueStatus: "idle",
  lastQueueParams: {},

  actionPendingId: null,
};

export const submitRequest = createAsyncThunk(
  "requests/submit",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const request = await requestService.createRequest(payload);
      toast.success(`Request submitted — reference ${request.referenceCode}`);
      dispatch(fetchBookById(payload.book));
      return request;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMyRequests = createAsyncThunk(
  "requests/fetchMine",
  async (params, { rejectWithValue }) => {
    try {
      return await requestService.getMyRequests(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRequestQueue = createAsyncThunk(
  "requests/fetchQueue",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await requestService.getRequestQueue(params);
      return { ...result, params };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const approveRequest = createAsyncThunk(
  "requests/approve",
  async ({ id, note }, { dispatch, getState, rejectWithValue }) => {
    try {
      const request = await requestService.approveRequest(id, { note });
      toast.success("Request approved");
      dispatch(fetchRequestQueue(getState().requests.lastQueueParams));
      return request;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const rejectRequest = createAsyncThunk(
  "requests/reject",
  async ({ id, reason }, { dispatch, getState, rejectWithValue }) => {
    try {
      const request = await requestService.rejectRequest(id, { reason });
      toast.success("Request rejected");
      dispatch(fetchRequestQueue(getState().requests.lastQueueParams));
      return request;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const cancelRequest = createAsyncThunk(
  "requests/cancel",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const request = await requestService.cancelRequest(id);
      toast.success("Request cancelled");
      dispatch(fetchMyRequests());
      dispatch(fetchBookById(request.book._id));
      return request;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    clearMyRequests(state) {
      state.myRequests = [];
      state.myRequestsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRequests.pending, (state) => {
        state.myRequestsStatus = "loading";
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myRequestsStatus = "succeeded";
        state.myRequests = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state) => {
        state.myRequestsStatus = "failed";
      })

      .addCase(fetchRequestQueue.pending, (state) => {
        state.queueStatus = "loading";
      })
      .addCase(fetchRequestQueue.fulfilled, (state, action) => {
        state.queueStatus = "succeeded";
        state.queue = action.payload.requests;
        state.queuePagination = action.payload.pagination;
        state.lastQueueParams = action.payload.params;
      })
      .addCase(fetchRequestQueue.rejected, (state) => {
        state.queueStatus = "failed";
      })

      .addCase(approveRequest.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.id;
      })
      .addCase(approveRequest.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(approveRequest.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(rejectRequest.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.id;
      })
      .addCase(rejectRequest.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(rejectRequest.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(cancelRequest.pending, (state, action) => {
        state.actionPendingId = action.meta.arg;
      })
      .addCase(cancelRequest.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(cancelRequest.rejected, (state) => {
        state.actionPendingId = null;
      });
  },
});

export const { clearMyRequests } = requestsSlice.actions;
export default requestsSlice.reducer;
