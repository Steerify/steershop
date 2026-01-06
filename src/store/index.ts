import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import activityReducer from './slices/activitySlice';
import cartReducer from './slices/cartSlice';
import formReducer from './slices/formSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  activity: activityReducer,
  cart: cartReducer,
  forms: formReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: 'steersolo-root',
  version: 1,
  storage,
  whitelist: ['cart', 'forms', 'ui'], // Persist these slices
  blacklist: ['activity'], // Don't persist activity timestamps
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
