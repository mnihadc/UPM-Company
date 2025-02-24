import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./user/userSlice"; // ✅ Corrected import

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer, // ✅ Persist only the user slice
});

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["user"], // ✅ Ensures only 'user' state is persisted
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Required for Redux Persist
    }),
});

// Persistor to manage storage
export const persistor = persistStore(store);
