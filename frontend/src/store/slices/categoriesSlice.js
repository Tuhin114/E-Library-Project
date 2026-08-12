import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../../services/categoryService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  selected: null,
  status: "idle", // list fetch status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  detailStatus: "idle", // single-category fetch status, tracked separately from the list
  detailError: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getCategories();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryBySlug(slug);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (payload, { rejectWithValue }) => {
    try {
      const category = await categoryService.createCategory(payload);
      toast.success("Category created successfully");
      return category;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const category = await categoryService.updateCategory(id, payload);
      toast.success("Category updated successfully");
      return category;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success("Category deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory: (state) => {
      state.selected = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        toast.error(action.payload || "Failed to load categories");
      })
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
        toast.error(action.payload || "Failed to load category");
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
