import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as libraryService from "../../services/libraryService";
import { toast } from "../../hooks/useToast";

const initialState = {
  favorites: [],
  favoriteIds: [],
  recentlyViewed: [],
  continueReading: [],
  recommendations: [],
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
        toast.error(action.payload || "Failed to load your continue reading list");
      })
      // Deliberately no pending/rejected status wiring for
      // recommendations — it renders on the Books catalog page
      // alongside the main grid, and that page already has its own
      // loading state (`state.books.status`) driving the skeleton.
      // A failed recommendations fetch just means the row doesn't
      // render; it shouldn't flip the whole page into an error state.
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, () => {
        // Silent — see comment above.
      });
  },
});

export default librarySlice.reducer;
