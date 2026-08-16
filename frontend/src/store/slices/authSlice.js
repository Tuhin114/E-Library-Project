import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "@/services/authService";
import * as profileService from "@/services/profileService";

/**
 * Login thunk. Delegates the actual HTTP call + error normalization to
 * authService, and only handles Redux-specific concerns here (payload
 * shape for extraReducers, rejectWithValue for the rejected case).
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials); // { user, accessToken }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * Session bootstrap thunk. Dispatched once on app load (see App.jsx).
 * Tries to reissue an access token from the refresh-token cookie, then
 * fetches the current user with it — the two-step flow that makes an
 * authenticated session survive a page refresh.
 *
 * A rejection here (no cookie, expired refresh token) is the normal,
 * expected "not logged in" case, not an error — nothing is shown to the
 * user for it, `isInitializing` just flips to false with no session set.
 */
export const initializeSession = createAsyncThunk(
  "auth/initializeSession",
  async (_, { rejectWithValue }) => {
    try {
      const { accessToken } = await authService.refreshAccessToken();
      const { user } = await authService.getCurrentUser(accessToken);
      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(null);
    }
  },
);

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' — tracks the login thunk
  error: null,
  // True until the initial session-bootstrap check completes. Routes
  // (see App.jsx) hold off rendering while this is true, so PrivateRoute
  // never makes a redirect decision based on incomplete state.
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Updates the session in place without touching `status`/`error`.
    // Used by the axios response interceptor after a silent mid-session
    // token refresh (see api/axiosInstance.js) — a plain synchronous
    // action, not a thunk, since the interceptor is already mid-promise-chain.
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    // Local-only session clear — does not call the backend. Used by the
    // axios interceptor when a silent refresh fails, and internally by
    // the logoutUser thunk below after the backend call succeeds/fails.
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.status = "idle";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    // Patches the logged-in user in place — unlike setCredentials, does
    // not touch accessToken/isAuthenticated. Used after a profile/avatar
    // update, where the session itself hasn't changed.
    updateUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(initializeSession.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitializing = false;
      })
      .addCase(initializeSession.rejected, (state) => {
        state.isInitializing = false;
        // isAuthenticated intentionally left false — no valid session found.
      });
  },
});

export const { setCredentials, clearCredentials, clearAuthError, updateUser } =
  authSlice.actions;
export default authSlice.reducer;

/**
 * Logout thunk. Calls the backend to clear the refresh-token cookie,
 * then clears local state regardless of whether that call succeeded —
 * a failed logout request should never leave the user stuck looking
 * logged in. Declared after the slice so it can dispatch clearCredentials.
 */
export const logoutUser = () => async (dispatch) => {
  await authService.logout();
  dispatch(clearCredentials());
};

/**
 * Change-password thunk. Named changeUserPassword (rather than
 * changePassword) to stay distinct from authService.changePassword,
 * which it calls into.
 *
 * On success, the backend has already cleared the refresh-token
 * cookie (a password change ends the current session by design — see
 * the controller), so this clears local state to match and the caller
 * (ChangePasswordForm) redirects to /login. Errors are intentionally
 * NOT swallowed here — e.g. "current password is incorrect" needs to
 * reach the form.
 */
export const changeUserPassword = (payload) => async (dispatch) => {
  await authService.changePassword(payload);
  dispatch(clearCredentials());
};

/**
 * Profile/avatar thunks (M1). Errors are intentionally NOT swallowed —
 * the calling form/page shows them via toast, same convention as
 * changeUserPassword above.
 */
export const updateUserProfile = (payload) => async (dispatch) => {
  const user = await profileService.updateProfile(payload);
  dispatch(updateUser(user));
};

export const uploadUserAvatar = (file) => async (dispatch) => {
  const user = await profileService.uploadAvatar(file);
  dispatch(updateUser(user));
};

export const removeUserAvatar = () => async (dispatch) => {
  const user = await profileService.removeAvatar();
  dispatch(updateUser(user));
};
