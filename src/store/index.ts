
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';

// Simple store without persistence or complex middleware
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Simple type exports
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
