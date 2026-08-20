import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as forumService from "../../services/forumService";
import { toast } from "../../hooks/useToast";

const initialState = {
  threads: [],
  threadsPagination: null,
  threadsStatus: "idle",
  currentThread: null,
  currentThreadStatus: "idle",
  reports: [],
  reportsStatus: "idle",
};

export const fetchThreads = createAsyncThunk(
  "forum/fetchThreads",
  async (params, { rejectWithValue }) => {
    try {
      return await forumService.getThreads(params);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createThread = createAsyncThunk(
  "forum/createThread",
  async (payload, { rejectWithValue }) => {
    try {
      const thread = await forumService.createThread(payload);
      toast.success("Thread posted");
      return thread;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchThreadDetail = createAsyncThunk(
  "forum/fetchThreadDetail",
  async (threadId, { rejectWithValue }) => {
    try {
      return await forumService.getThread(threadId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const postThreadReply = createAsyncThunk(
  "forum/postThreadReply",
  async ({ threadId, payload }, { rejectWithValue }) => {
    try {
      return await forumService.createReply(threadId, payload);
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteThreadReply = createAsyncThunk(
  "forum/deleteThreadReply",
  async (replyId, { rejectWithValue }) => {
    try {
      await forumService.deleteReply(replyId);
      toast.success("Reply deleted");
      return replyId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const deleteThread = createAsyncThunk(
  "forum/deleteThread",
  async (threadId, { rejectWithValue }) => {
    try {
      await forumService.deleteThread(threadId);
      toast.success("Thread deleted");
      return threadId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const toggleThreadLock = createAsyncThunk(
  "forum/toggleThreadLock",
  async (threadId, { rejectWithValue }) => {
    try {
      const thread = await forumService.toggleThreadLock(threadId);
      toast.success(thread.isLocked ? "Thread locked" : "Thread unlocked");
      return thread;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const toggleThreadPin = createAsyncThunk(
  "forum/toggleThreadPin",
  async (threadId, { rejectWithValue }) => {
    try {
      const thread = await forumService.toggleThreadPin(threadId);
      toast.success(thread.isPinned ? "Thread pinned" : "Thread unpinned");
      return thread;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

// Shared by both "report a thread" and "report a reply" dialogs —
// caller passes whichever targetType applies.
export const reportContent = createAsyncThunk(
  "forum/reportContent",
  async ({ targetType, targetId, payload }, { rejectWithValue }) => {
    try {
      const report =
        targetType === "thread"
          ? await forumService.reportThread(targetId, payload)
          : await forumService.reportReply(targetId, payload);
      toast.success("Thanks — a librarian will review this.");
      return report;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const fetchReports = createAsyncThunk(
  "forum/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      return await forumService.getReports();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const resolveReport = createAsyncThunk(
  "forum/resolveReport",
  async (reportId, { rejectWithValue }) => {
    try {
      await forumService.resolveReport(reportId);
      toast.success("Report resolved");
      return reportId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const patchThreadLists = (state, action) => {
  const updatedThread = action.payload;
  if (state.currentThread && state.currentThread._id === updatedThread._id) {
    state.currentThread.isLocked = updatedThread.isLocked;
    state.currentThread.isPinned = updatedThread.isPinned;
  }
  const index = state.threads.findIndex((thread) => thread._id === updatedThread._id);
  if (index !== -1) {
    state.threads[index].isLocked = updatedThread.isLocked;
    state.threads[index].isPinned = updatedThread.isPinned;
  }
};

const forumSlice = createSlice({
  name: "forum",
  initialState,
  reducers: {
    clearCurrentThread(state) {
      state.currentThread = null;
      state.currentThreadStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => {
        state.threadsStatus = "loading";
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.threadsStatus = "succeeded";
        state.threads = action.payload.threads;
        state.threadsPagination = action.payload.pagination;
      })
      .addCase(fetchThreads.rejected, (state) => {
        state.threadsStatus = "failed";
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.threads.unshift(action.payload);
      })
      .addCase(fetchThreadDetail.pending, (state) => {
        state.currentThreadStatus = "loading";
      })
      .addCase(fetchThreadDetail.fulfilled, (state, action) => {
        state.currentThreadStatus = "succeeded";
        state.currentThread = action.payload;
      })
      .addCase(fetchThreadDetail.rejected, (state) => {
        state.currentThreadStatus = "failed";
      })
      .addCase(postThreadReply.fulfilled, (state, action) => {
        if (state.currentThread) {
          state.currentThread.replies.push(action.payload);
          state.currentThread.replyCount += 1;
        }
      })
      .addCase(deleteThreadReply.fulfilled, (state, action) => {
        if (state.currentThread) {
          state.currentThread.replies = state.currentThread.replies.filter(
            (reply) => reply._id !== action.payload,
          );
          state.currentThread.replyCount -= 1;
        }
      })
      .addCase(deleteThread.fulfilled, (state, action) => {
        state.threads = state.threads.filter((thread) => thread._id !== action.payload);
      })
      .addCase(toggleThreadLock.fulfilled, patchThreadLists)
      .addCase(toggleThreadPin.fulfilled, patchThreadLists)
      .addCase(fetchReports.pending, (state) => {
        state.reportsStatus = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reportsStatus = "succeeded";
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state) => {
        state.reportsStatus = "failed";
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter((report) => report._id !== action.payload);
      });
  },
});

export const { clearCurrentThread } = forumSlice.actions;
export default forumSlice.reducer;
