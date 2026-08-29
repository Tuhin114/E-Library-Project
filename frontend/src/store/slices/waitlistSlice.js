import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as waitlistService from "../../services/waitlistService";
import { toast } from "../../hooks/useToast";

const initialState = {
  myEntries: [],
  myEntriesStatus: "idle",

  bookQueue: [],
  bookQueueStatus: "idle",
  bookQueueBookId: null,

  actionPendingId: null,
};

export const fetchMyWaitlist = createAsyncThunk(
  "waitlist/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return await waitlistService.getMyWaitlist();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchWaitlistForBook = createAsyncThunk(
  "waitlist/fetchForBook",
  async (bookId, { rejectWithValue }) => {
    try {
      const entries = await waitlistService.getWaitlistForBook(bookId);
      return { bookId, entries };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Every mutation below re-fetches "my waitlist" on success rather than
// patching a single entry in place — same trade-off FavoriteButton's
// own toggle makes (see librarySlice), and here it also has to be a
// full refetch anyway since joining/leaving/claiming can shift every
// other entry's queue position for the same book.
export const joinWaitlist = createAsyncThunk(
  "waitlist/join",
  async (bookId, { dispatch, rejectWithValue }) => {
    try {
      await waitlistService.joinWaitlist(bookId);
      toast.success("You're on the waitlist — we'll notify you when a copy is ready");
      dispatch(fetchMyWaitlist());
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const leaveWaitlist = createAsyncThunk(
  "waitlist/leave",
  async (waitlistId, { dispatch, rejectWithValue }) => {
    try {
      await waitlistService.leaveWaitlist(waitlistId);
      toast.success("Left the waitlist");
      dispatch(fetchMyWaitlist());
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

export const claimWaitlistEntry = createAsyncThunk(
  "waitlist/claim",
  async ({ waitlistId, requestedReturnDate }, { dispatch, rejectWithValue }) => {
    try {
      await waitlistService.claimWaitlistEntry(
        waitlistId,
        requestedReturnDate ? { requestedReturnDate } : {},
      );
      toast.success("Hold claimed — visit the library to collect your book");
      dispatch(fetchMyWaitlist());
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const waitlistSlice = createSlice({
  name: "waitlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWaitlist.pending, (state) => {
        state.myEntriesStatus = "loading";
      })
      .addCase(fetchMyWaitlist.fulfilled, (state, action) => {
        state.myEntriesStatus = "succeeded";
        state.myEntries = action.payload;
      })
      .addCase(fetchMyWaitlist.rejected, (state) => {
        state.myEntriesStatus = "failed";
      })

      .addCase(fetchWaitlistForBook.pending, (state) => {
        state.bookQueueStatus = "loading";
      })
      .addCase(fetchWaitlistForBook.fulfilled, (state, action) => {
        state.bookQueueStatus = "succeeded";
        state.bookQueue = action.payload.entries;
        state.bookQueueBookId = action.payload.bookId;
      })
      .addCase(fetchWaitlistForBook.rejected, (state) => {
        state.bookQueueStatus = "failed";
      })

      .addCase(joinWaitlist.pending, (state, action) => {
        state.actionPendingId = action.meta.arg;
      })
      .addCase(joinWaitlist.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(joinWaitlist.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(leaveWaitlist.pending, (state, action) => {
        state.actionPendingId = action.meta.arg;
      })
      .addCase(leaveWaitlist.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(leaveWaitlist.rejected, (state) => {
        state.actionPendingId = null;
      })

      .addCase(claimWaitlistEntry.pending, (state, action) => {
        state.actionPendingId = action.meta.arg.waitlistId;
      })
      .addCase(claimWaitlistEntry.fulfilled, (state) => {
        state.actionPendingId = null;
      })
      .addCase(claimWaitlistEntry.rejected, (state) => {
        state.actionPendingId = null;
      });
  },
});

export default waitlistSlice.reducer;
