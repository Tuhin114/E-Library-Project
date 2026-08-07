import { configureStore } from '@reduxjs/toolkit';

/**
 * Central Redux store.
 * Feature slices (e.g. authSlice) are registered in the `reducer` map
 * as they are built — starting with authSlice in M4.
 */
export const store = configureStore({
  reducer: {},
  devTools: import.meta.env.MODE !== 'production',
});
