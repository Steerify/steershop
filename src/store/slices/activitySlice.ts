import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActivityState {
  lastActivity: number;
  isWarningShown: boolean;
  sessionStartedAt: number;
  rememberMe: boolean;
}

const initialState: ActivityState = {
  lastActivity: Date.now(),
  isWarningShown: false,
  sessionStartedAt: Date.now(),
  rememberMe: localStorage.getItem('rememberMe') === 'true',
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    updateActivity: (state) => {
      state.lastActivity = Date.now();
      state.isWarningShown = false;
    },
    showWarning: (state) => {
      state.isWarningShown = true;
    },
    hideWarning: (state) => {
      state.isWarningShown = false;
    },
    resetSession: (state) => {
      state.lastActivity = Date.now();
      state.isWarningShown = false;
      state.sessionStartedAt = Date.now();
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
      localStorage.setItem('rememberMe', action.payload.toString());
    },
  },
});

export const { updateActivity, showWarning, hideWarning, resetSession, setRememberMe } = activitySlice.actions;
export default activitySlice.reducer;
