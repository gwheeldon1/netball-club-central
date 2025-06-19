
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { permissionsApi } from './api/permissionsApi';

// Simple persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

// Root reducer without complex types
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  ui: uiSlice.reducer,
  [permissionsApi.reducerPath]: permissionsApi.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration with simplified middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(permissionsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Simple type exports
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
