import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "../Redux/user/userSlice";
import { persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";

// Set expiration time (8 hours in milliseconds)
const EXPIRATION_TIME = 8 * 60 * 60 * 1000;

// Transform to check expiration
const expirationTransform = createTransform(
  // Transform state before saving
  (inboundState) => {
    return {
      ...inboundState,
      _persistedAt: Date.now(), // Store timestamp
    };
  },
  // Transform state before loading
  (outboundState) => {
    const currentTime = Date.now();
    if (
      outboundState._persistedAt &&
      currentTime - outboundState._persistedAt > EXPIRATION_TIME
    ) {
      console.log("Persisted state expired. Clearing Redux store.");
      return undefined; // Clear stored state if expired
    }
    return outboundState;
  }
);

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  transforms: [expirationTransform], // Add transform for expiration check
};

const rootReducer = combineReducers({ user: userReducer });
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
