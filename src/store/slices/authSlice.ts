
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  sessionChecked: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSessionChecked: (state, action: PayloadAction<boolean>) => {
      state.sessionChecked = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.sessionChecked = true;
    },
  },
});

export const { setUser, setLoading, setError, setSessionChecked, clearAuth } = authSlice.actions;
