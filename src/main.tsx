import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { store, persistor } from "./store";
import { PageLoadingSkeleton } from "./components/PageLoadingSkeleton";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={<PageLoadingSkeleton />} persistor={persistor}>
          <AuthProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </ErrorBoundary>
);
