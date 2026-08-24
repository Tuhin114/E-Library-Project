import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as analyticsService from "../../services/analyticsService";
import { toast } from "../../hooks/useToast";

// Deliberately its own slice rather than folded into librarySlice —
// this is librarian-only catalog data, not "my library" data, and
// M3/M4 will add engagement/moderation state here too, so keeping
// analytics self-contained from the start avoids a student/faculty
// user's library state carrying fields they'll never populate.
const initialState = {
  catalog: null,
  catalogStatus: "idle",
  engagement: null,
  engagementStatus: "idle",
  moderation: null,
  moderationStatus: "idle",
};

export const fetchCatalogAnalytics = createAsyncThunk(
  "analytics/fetchCatalogAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.getCatalogAnalytics(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchEngagementAnalytics = createAsyncThunk(
  "analytics/fetchEngagementAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.getEngagementAnalytics(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchModerationAnalytics = createAsyncThunk(
  "analytics/fetchModerationAnalytics",
  async (params, { rejectWithValue }) => {
    try {
      return await analyticsService.getModerationAnalytics(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogAnalytics.pending, (state) => {
        state.catalogStatus = "loading";
      })
      .addCase(fetchCatalogAnalytics.fulfilled, (state, action) => {
        state.catalogStatus = "succeeded";
        state.catalog = action.payload;
      })
      .addCase(fetchCatalogAnalytics.rejected, (state, action) => {
        state.catalogStatus = "failed";
        toast.error(action.payload || "Failed to load catalog analytics");
      })
      .addCase(fetchEngagementAnalytics.pending, (state) => {
        state.engagementStatus = "loading";
      })
      .addCase(fetchEngagementAnalytics.fulfilled, (state, action) => {
        state.engagementStatus = "succeeded";
        state.engagement = action.payload;
      })
      .addCase(fetchEngagementAnalytics.rejected, (state, action) => {
        state.engagementStatus = "failed";
        toast.error(action.payload || "Failed to load engagement analytics");
      })
      .addCase(fetchModerationAnalytics.pending, (state) => {
        state.moderationStatus = "loading";
      })
      .addCase(fetchModerationAnalytics.fulfilled, (state, action) => {
        state.moderationStatus = "succeeded";
        state.moderation = action.payload;
      })
      .addCase(fetchModerationAnalytics.rejected, (state, action) => {
        state.moderationStatus = "failed";
        toast.error(action.payload || "Failed to load moderation analytics");
      });
  },
});

export default analyticsSlice.reducer;
