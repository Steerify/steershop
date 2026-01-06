import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { store, persistor } from "./store";
import { PageLoadingSkeleton } from "./components/PageLoadingSkeleton";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<PageLoadingSkeleton />} persistor={persistor}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PersistGate>
  </Provider>
);
