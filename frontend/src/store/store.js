import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoriesReducer from "./slices/categoriesSlice";
import authorsReducer from "./slices/authorsSlice";
import publishersReducer from "./slices/publishersSlice";
import booksReducer from "./slices/booksSlice";
import libraryReducer from "./slices/librarySlice";
import reviewsReducer from "./slices/reviewsSlice";
import discussionsReducer from "./slices/discussionsSlice";
/**
 * Central Redux store.
 * Feature slices are registered in the `reducer` map as they are built.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    authors: authorsReducer,
    publishers: publishersReducer,
    books: booksReducer,
    library: libraryReducer,
    reviews: reviewsReducer,
    discussions: discussionsReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});
