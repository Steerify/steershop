import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActivityState {
  lastActivity: number;
  isWarningShown: boolean;
  sessionStartedAt: number;
}

const initialState: ActivityState = {
  lastActivity: Date.now(),
  isWarningShown: false,
  sessionStartedAt: Date.now(),
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
  },
});

export const { updateActivity, showWarning, hideWarning, resetSession } = activitySlice.actions;
export default activitySlice.reducer;
