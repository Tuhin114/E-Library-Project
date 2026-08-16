import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as discussionService from "../../services/discussionService";
import { toast } from "../../hooks/useToast";

const initialState = {
  items: [],
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchDiscussions = createAsyncThunk(
  "discussions/fetchForBook",
  async (bookId, { rejectWithValue }) => {
    try {
      return await discussionService.getBookDiscussions(bookId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const postDiscussion = createAsyncThunk(
  "discussions/post",
  async ({ bookId, payload }, { rejectWithValue }) => {
    try {
      return await discussionService.createDiscussion(bookId, payload);
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const postReply = createAsyncThunk(
  "discussions/postReply",
  async ({ discussionId, payload }, { rejectWithValue }) => {
    try {
      const reply = await discussionService.createReply(discussionId, payload);
      return { discussionId, reply };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const removeDiscussion = createAsyncThunk(
  "discussions/remove",
  async (discussionId, { rejectWithValue }) => {
    try {
      await discussionService.deleteDiscussion(discussionId);
      toast.success("Post deleted");
      return discussionId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const removeReply = createAsyncThunk(
  "discussions/removeReply",
  async ({ replyId, discussionId }, { rejectWithValue }) => {
    try {
      await discussionService.deleteReply(replyId);
      toast.success("Reply deleted");
      return { replyId, discussionId };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const discussionsSlice = createSlice({
  name: "discussions",
  initialState,
  reducers: {
    clearDiscussions(state) {
      state.items = [];
      state.pagination = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscussions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.discussions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDiscussions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(postDiscussion.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(postReply.fulfilled, (state, action) => {
        const { discussionId, reply } = action.payload;
        const discussion = state.items.find((item) => item._id === discussionId);
        if (discussion) discussion.replies.push(reply);
      })
      .addCase(removeDiscussion.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeReply.fulfilled, (state, action) => {
        const { replyId, discussionId } = action.payload;
        const discussion = state.items.find((item) => item._id === discussionId);
        if (discussion) {
          discussion.replies = discussion.replies.filter((reply) => reply._id !== replyId);
        }
      });
  },
});

export const { clearDiscussions } = discussionsSlice.actions;
export default discussionsSlice.reducer;
