import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as publisherService from "../../services/publisherService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
  detailStatus: "idle",
  detailError: null,
};

export const fetchPublishers = createAsyncThunk(
  "publishers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await publisherService.getPublishers();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPublisherBySlug = createAsyncThunk(
  "publishers/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await publisherService.getPublisherBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createPublisher = createAsyncThunk(
  "publishers/create",
  async (payload, { rejectWithValue }) => {
    try {
      const publisher = await publisherService.createPublisher(payload);
      toast.success("Publisher created successfully");
      return publisher;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updatePublisher = createAsyncThunk(
  "publishers/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const publisher = await publisherService.updatePublisher(id, payload);
      toast.success("Publisher updated successfully");
      return publisher;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deletePublisher = createAsyncThunk(
  "publishers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await publisherService.deletePublisher(id);
      toast.success("Publisher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const publishersSlice = createSlice({
  name: "publishers",
  initialState,
  reducers: {
    clearSelectedPublisher: (state) => {
      state.selected = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPublishers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPublishers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load publishers");
      })
      .addCase(fetchPublisherBySlug.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchPublisherBySlug.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchPublisherBySlug.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
        toast.error(action.payload || "Failed to load publisher");
      })
      .addCase(createPublisher.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePublisher.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deletePublisher.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearSelectedPublisher } = publishersSlice.actions;
export default publishersSlice.reducer;
