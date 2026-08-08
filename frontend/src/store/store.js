import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

/**
 * Central Redux store.
 * Feature slices are registered in the `reducer` map as they are built.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});
