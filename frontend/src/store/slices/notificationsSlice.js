import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationService from "../../services/notificationService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  pagination: null,
  unreadCount: 0,
  status: "idle",
  error: null,
  preferences: null,
  preferencesStatus: "idle",
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (params, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeNotification = createAsyncThunk(
  "notifications/remove",
  async (id, { rejectWithValue }) => {
    try {
      return await notificationService.removeNotification(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPreferences = createAsyncThunk(
  "notifications/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getPreferences();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const savePreferences = createAsyncThunk(
  "notifications/savePreferences",
  async (payload, { rejectWithValue }) => {
    try {
      const preferences = await notificationService.savePreferences(payload);
      toast.success("Notification preferences updated");
      return preferences;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Dispatched by useSocket on a "notification:new" push — prepends
    // the notification and bumps the badge without a refetch, so the
    // bell updates the instant the event arrives instead of waiting
    // for the next poll.
    notificationReceived(state, action) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n._id === action.payload._id);
        if (index !== -1 && !state.items[index].isRead) {
          state.items[index] = action.payload;
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const removed = state.items.find((n) => n._id === action.payload);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(state.unreadCount - 1, 0);
        }
        state.items = state.items.filter((n) => n._id !== action.payload);
      })
      .addCase(fetchPreferences.pending, (state) => {
        state.preferencesStatus = "loading";
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferencesStatus = "succeeded";
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.preferencesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(savePreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { notificationReceived } = notificationsSlice.actions;
export default notificationsSlice.reducer;
