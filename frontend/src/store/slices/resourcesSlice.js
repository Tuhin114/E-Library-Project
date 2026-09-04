import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as resourceService from "../../services/resourceService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  selected: null,
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchResources = createAsyncThunk(
  "resources/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await resourceService.getResources(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchResourceById = createAsyncThunk(
  "resources/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await resourceService.getResourceById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createResource = createAsyncThunk(
  "resources/create",
  async (payload, { rejectWithValue }) => {
    try {
      const resource = await resourceService.createResource(payload);
      toast.success("Resource uploaded successfully");
      return resource;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updateResource = createAsyncThunk(
  "resources/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const resource = await resourceService.updateResource(id, payload);
      toast.success("Resource updated successfully");
      return resource;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteResource = createAsyncThunk(
  "resources/delete",
  async (id, { rejectWithValue }) => {
    try {
      await resourceService.deleteResource(id);
      toast.success("Resource deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const uploadResourceFile = createAsyncThunk(
  "resources/uploadFile",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const resource = await resourceService.uploadResourceFile(id, file);
      toast.success("File uploaded successfully");
      return resource;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteResourceFile = createAsyncThunk(
  "resources/deleteFile",
  async (id, { rejectWithValue }) => {
    try {
      const resource = await resourceService.deleteResourceFile(id);
      toast.success("File removed");
      return resource;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const applyUpdatedResource = (state, updatedResource) => {
  const index = state.items.findIndex((r) => r._id === updatedResource._id);
  if (index !== -1) state.items[index] = updatedResource;
  if (state.selected?._id === updatedResource._id) {
    state.selected = updatedResource;
  }
};

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    clearSelectedResource: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.resources;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load resources");
      })
      .addCase(fetchResourceById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load resource");
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        applyUpdatedResource(state, action.payload);
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
      })
      .addCase(uploadResourceFile.fulfilled, (state, action) => {
        applyUpdatedResource(state, action.payload);
      })
      .addCase(deleteResourceFile.fulfilled, (state, action) => {
        applyUpdatedResource(state, action.payload);
      });
  },
});

export const { clearSelectedResource } = resourcesSlice.actions;
export default resourcesSlice.reducer;
