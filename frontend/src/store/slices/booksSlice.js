import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as bookService from "../../services/bookService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  selected: null,
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchBooks = createAsyncThunk(
  "books/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await bookService.getBooks(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchBookById = createAsyncThunk(
  "books/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await bookService.getBookById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createBook = createAsyncThunk(
  "books/create",
  async (payload, { rejectWithValue }) => {
    try {
      const book = await bookService.createBook(payload);
      toast.success("Book created successfully");
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updateBook = createAsyncThunk(
  "books/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const book = await bookService.updateBook(id, payload);
      toast.success("Book updated successfully");
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteBook = createAsyncThunk(
  "books/delete",
  async (id, { rejectWithValue }) => {
    try {
      await bookService.deleteBook(id);
      toast.success("Book deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const uploadCoverImage = createAsyncThunk(
  "books/uploadCoverImage",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const book = await bookService.uploadCoverImage(id, file);
      toast.success("Cover image uploaded successfully");
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const importCoverImageFromUrl = createAsyncThunk(
  "books/importCoverImageFromUrl",
  async ({ id, url }, { rejectWithValue }) => {
    try {
      const book = await bookService.importCoverImageFromUrl(id, url);
      toast.success("Cover image fetched and uploaded successfully");
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCoverImage = createAsyncThunk(
  "books/deleteCoverImage",
  async (id, { rejectWithValue }) => {
    try {
      const book = await bookService.deleteCoverImage(id);
      toast.success("Cover image deleted successfully");
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const uploadDigitalFile = createAsyncThunk(
  "books/uploadDigitalFile",
  async ({ id, type, file }, { rejectWithValue }) => {
    try {
      const book = await bookService.uploadDigitalFile(id, type, file);
      toast.success(`${type.toUpperCase()} uploaded successfully`);
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const importDigitalFileFromUrl = createAsyncThunk(
  "books/importDigitalFileFromUrl",
  async ({ id, type, url }, { rejectWithValue }) => {
    try {
      const book = await bookService.importDigitalFileFromUrl(id, type, url);
      toast.success(`${type.toUpperCase()} fetched and uploaded successfully`);
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteDigitalFile = createAsyncThunk(
  "books/deleteDigitalFile",
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const book = await bookService.deleteDigitalFile(id, type);
      toast.success(`${type.toUpperCase()} deleted successfully`);
      return book;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const applyUpdatedBook = (state, updatedBook) => {
  const index = state.items.findIndex((b) => b._id === updatedBook._id);
  if (index !== -1) state.items[index] = updatedBook;
  if (state.selected?._id === updatedBook._id) state.selected = updatedBook;
};

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearSelectedBook: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load books");
      })
      .addCase(fetchBookById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load book");
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      })
      .addCase(uploadCoverImage.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(importCoverImageFromUrl.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(deleteCoverImage.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(uploadDigitalFile.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(importDigitalFileFromUrl.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      })
      .addCase(deleteDigitalFile.fulfilled, (state, action) => {
        applyUpdatedBook(state, action.payload);
      });
  },
});

export const { clearSelectedBook } = booksSlice.actions;
export default booksSlice.reducer;
