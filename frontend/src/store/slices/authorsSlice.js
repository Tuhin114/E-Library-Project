import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authorService from "../../services/authorService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
  detailStatus: "idle",
  detailError: null,
};

export const fetchAuthors = createAsyncThunk(
  "authors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await authorService.getAuthors();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAuthorBySlug = createAsyncThunk(
  "authors/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await authorService.getAuthorBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createAuthor = createAsyncThunk(
  "authors/create",
  async (payload, { rejectWithValue }) => {
    try {
      const author = await authorService.createAuthor(payload);
      toast.success("Author created successfully");
      return author;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updateAuthor = createAsyncThunk(
  "authors/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const author = await authorService.updateAuthor(id, payload);
      toast.success("Author updated successfully");
      return author;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteAuthor = createAsyncThunk(
  "authors/delete",
  async (id, { rejectWithValue }) => {
    try {
      await authorService.deleteAuthor(id);
      toast.success("Author deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const authorsSlice = createSlice({
  name: "authors",
  initialState,
  reducers: {
    clearSelectedAuthor: (state) => {
      state.selected = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load authors");
      })
      .addCase(fetchAuthorBySlug.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchAuthorBySlug.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchAuthorBySlug.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
        toast.error(action.payload || "Failed to load author");
      })
      .addCase(createAuthor.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateAuthor.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (a) => a._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      });
  },
});

export const { clearSelectedAuthor } = authorsSlice.actions;
export default authorsSlice.reducer;
