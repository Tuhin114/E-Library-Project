import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoriesReducer from "./slices/categoriesSlice";
import authorsReducer from "./slices/authorsSlice";
import publishersReducer from "./slices/publishersSlice";
import booksReducer from "./slices/booksSlice";
import libraryReducer from "./slices/librarySlice";
import reviewsReducer from "./slices/reviewsSlice";
import discussionsReducer from "./slices/discussionsSlice";
import forumReducer from "./slices/forumSlice";
import analyticsReducer from "./slices/analyticsSlice";
import copiesReducer from "./slices/copiesSlice";
import requestsReducer from "./slices/requestsSlice";
import loansReducer from "./slices/loansSlice";
import feesReducer from "./slices/feesSlice";
import settingsReducer from "./slices/settingsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import waitlistReducer from "./slices/waitlistSlice";
import resourcesReducer from "./slices/resourcesSlice";
import savedListsReducer from "./slices/savedListsSlice";
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
    forum: forumReducer,
    analytics: analyticsReducer,
    copies: copiesReducer,
    requests: requestsReducer,
    loans: loansReducer,
    fees: feesReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    waitlist: waitlistReducer,
    resources: resourcesReducer,
    savedLists: savedListsReducer,
  },
  devTools: import.meta.env.MODE !== "production",
});
