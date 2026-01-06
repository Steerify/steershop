import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PendingAction {
  type: string;
  payload?: unknown;
  timestamp: string;
}

interface UIState {
  lastRoute: string | null;
  pendingActions: PendingAction[];
  sessionExpiredAt: string | null;
  returnUrl: string | null;
}

const initialState: UIState = {
  lastRoute: null,
  pendingActions: [],
  sessionExpiredAt: null,
  returnUrl: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLastRoute: (state, action: PayloadAction<string>) => {
      state.lastRoute = action.payload;
    },
    setReturnUrl: (state, action: PayloadAction<string | null>) => {
      state.returnUrl = action.payload;
    },
    addPendingAction: (state, action: PayloadAction<Omit<PendingAction, 'timestamp'>>) => {
      state.pendingActions.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
    setSessionExpired: (state) => {
      state.sessionExpiredAt = new Date().toISOString();
    },
    clearSessionExpired: (state) => {
      state.sessionExpiredAt = null;
    },
    clearUIState: (state) => {
      state.pendingActions = [];
      state.sessionExpiredAt = null;
      // Keep lastRoute and returnUrl for restoration after login
    },
  },
});

export const {
  setLastRoute,
  setReturnUrl,
  addPendingAction,
  clearPendingActions,
  setSessionExpired,
  clearSessionExpired,
  clearUIState,
} = uiSlice.actions;
export default uiSlice.reducer;
