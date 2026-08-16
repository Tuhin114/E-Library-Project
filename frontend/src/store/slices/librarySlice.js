import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as libraryService from "../../services/libraryService";
import * as profileService from "../../services/profileService";
import { toast } from "../../hooks/useToast";

const initialState = {
  favorites: [],
  favoriteIds: [],
  recentlyViewed: [],
  continueReading: [],
  recommendations: [],
  savedSearches: [],
  status: "idle",
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  "library/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      return await libraryService.getFavorites();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  "library/toggleFavorite",
  async ({ bookId, isFavorited }, { rejectWithValue }) => {
    try {
      if (isFavorited) {
        await libraryService.removeFavorite(bookId);
        toast.success("Removed from favorites");
      } else {
        await libraryService.addFavorite(bookId);
        toast.success("Added to favorites");
      }
      return { bookId, isFavorited: !isFavorited };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRecentlyViewed = createAsyncThunk(
  "library/fetchRecentlyViewed",
  async (_, { rejectWithValue }) => {
    try {
      return await libraryService.getRecentlyViewed();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchContinueReading = createAsyncThunk(
  "library/fetchContinueReading",
  async (_, { rejectWithValue }) => {
    try {
      return await libraryService.getContinueReading();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchRecommendations = createAsyncThunk(
  "library/fetchRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      return await libraryService.getRecommendations();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchSavedSearches = createAsyncThunk(
  "library/fetchSavedSearches",
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getSavedSearches();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveCurrentSearch = createAsyncThunk(
  "library/saveCurrentSearch",
  async (payload, { rejectWithValue }) => {
    try {
      return await profileService.saveSearch(payload);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeSavedSearch = createAsyncThunk(
  "library/removeSavedSearch",
  async (id, { rejectWithValue }) => {
    try {
      return await profileService.deleteSavedSearch(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.favorites = action.payload;
        state.favoriteIds = action.payload.map((book) => book._id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load favorites");
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { bookId, isFavorited } = action.payload;
        if (isFavorited) {
          if (!state.favoriteIds.includes(bookId))
            state.favoriteIds.push(bookId);
        } else {
          state.favoriteIds = state.favoriteIds.filter((id) => id !== bookId);
          state.favorites = state.favorites.filter(
            (book) => book._id !== bookId,
          );
        }
      })
      .addCase(fetchRecentlyViewed.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRecentlyViewed.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.recentlyViewed = action.payload;
      })
      .addCase(fetchRecentlyViewed.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load recently viewed books");
      })
      .addCase(fetchContinueReading.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchContinueReading.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.continueReading = action.payload;
      })
      .addCase(fetchContinueReading.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(
          action.payload || "Failed to load your continue reading list",
        );
      })
      .addCase(fetchSavedSearches.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSavedSearches.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.savedSearches = action.payload;
      })
      .addCase(fetchSavedSearches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load saved searches");
      })
      .addCase(removeSavedSearch.fulfilled, (state, action) => {
        state.savedSearches = state.savedSearches.filter(
          (search) => search._id !== action.meta.arg,
        );
      })
      .addCase(saveCurrentSearch.fulfilled, (state, action) => {
        state.savedSearches.push(action.payload);
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, () => {
        // Silent — see comment above.
      });
  },
});

export default librarySlice.reducer;
