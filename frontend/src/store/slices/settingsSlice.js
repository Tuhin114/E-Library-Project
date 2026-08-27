import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as settingsService from "../../services/settingsService";
import { toast } from "../../hooks/useToast";

const initialState = {
  settings: null,
  status: "idle",
  isSaving: false,
};

export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await settingsService.getSettings();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateSettings = createAsyncThunk(
  "settings/update",
  async (payload, { rejectWithValue }) => {
    try {
      const settings = await settingsService.updateSettings(payload);
      toast.success("Settings updated");
      return settings;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(updateSettings.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export default settingsSlice.reducer;
