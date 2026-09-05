import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as savedListService from "../../services/savedListService";
import { toast } from "../../hooks/useToast";

const initialState = {
  lists: [],
  listsStatus: "idle",
  selected: null,
  selectedStatus: "idle",
  error: null,
};

export const fetchSavedLists = createAsyncThunk(
  "savedLists/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await savedListService.getSavedLists();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchSavedListById = createAsyncThunk(
  "savedLists/fetchById",
  async (listId, { rejectWithValue }) => {
    try {
      return await savedListService.getSavedListById(listId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createSavedList = createAsyncThunk(
  "savedLists/create",
  async (payload, { rejectWithValue }) => {
    try {
      const list = await savedListService.createSavedList(payload);
      toast.success("List created");
      return list;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const updateSavedList = createAsyncThunk(
  "savedLists/update",
  async ({ listId, payload }, { rejectWithValue }) => {
    try {
      const list = await savedListService.updateSavedList(listId, payload);
      toast.success("List updated");
      return list;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteSavedList = createAsyncThunk(
  "savedLists/delete",
  async (listId, { rejectWithValue }) => {
    try {
      await savedListService.deleteSavedList(listId);
      toast.success("List deleted");
      return listId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const addItemToSavedList = createAsyncThunk(
  "savedLists/addItem",
  async ({ listId, resourceId }, { rejectWithValue }) => {
    try {
      const result = await savedListService.addItemToList(listId, resourceId);
      toast.success("Added to list");
      return result;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const removeItemFromSavedList = createAsyncThunk(
  "savedLists/removeItem",
  async ({ listId, resourceId }, { rejectWithValue }) => {
    try {
      const result = await savedListService.removeItemFromList(
        listId,
        resourceId,
      );
      toast.success("Removed from list");
      return result;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const savedListsSlice = createSlice({
  name: "savedLists",
  initialState,
  reducers: {
    clearSelectedSavedList: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedLists.pending, (state) => {
        state.listsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchSavedLists.fulfilled, (state, action) => {
        state.listsStatus = "succeeded";
        state.lists = action.payload;
      })
      .addCase(fetchSavedLists.rejected, (state, action) => {
        state.listsStatus = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSavedListById.pending, (state) => {
        state.selectedStatus = "loading";
      })
      .addCase(fetchSavedListById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchSavedListById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createSavedList.fulfilled, (state, action) => {
        state.lists.unshift({ ...action.payload, itemCount: 0 });
      })
      .addCase(updateSavedList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(
          (list) => list._id === action.payload._id,
        );
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...action.payload };
        }
        if (state.selected?._id === action.payload._id) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(deleteSavedList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((list) => list._id !== action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      })
      .addCase(removeItemFromSavedList.fulfilled, (state, action) => {
        if (state.selected?._id === action.payload.listId) {
          state.selected.items = state.selected.items.filter(
            (item) => item.resource._id !== action.payload.resourceId,
          );
        }
        const list = state.lists.find((l) => l._id === action.payload.listId);
        if (list && list.itemCount > 0) list.itemCount -= 1;
      })
      .addCase(addItemToSavedList.fulfilled, (state, action) => {
        const list = state.lists.find((l) => l._id === action.payload.listId);
        if (list) list.itemCount += 1;
      });
  },
});

export const { clearSelectedSavedList } = savedListsSlice.actions;
export default savedListsSlice.reducer;
