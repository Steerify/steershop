import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";

type ConnectionWithNetworkInfo = Navigator & {
  connection?: {
    effectiveType?: EffectiveConnectionType;
    saveData?: boolean;
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
  };
};

const getConnectionState = () => {
  const networkNavigator = navigator as ConnectionWithNetworkInfo;
  const connection = networkNavigator.connection;

  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    saveData: Boolean(connection?.saveData),
  };
};

export const NetworkStatusBanner = () => {
  const [networkState, setNetworkState] = useState(getConnectionState);

  useEffect(() => {
    const updateState = () => setNetworkState(getConnectionState());

    window.addEventListener("online", updateState);
    window.addEventListener("offline", updateState);

    const networkNavigator = navigator as ConnectionWithNetworkInfo;
    const connection = networkNavigator.connection;
    connection?.addEventListener?.("change", updateState);

    return () => {
      window.removeEventListener("online", updateState);
      window.removeEventListener("offline", updateState);
      connection?.removeEventListener?.("change", updateState);
    };
  }, []);

  const isSlowNetwork = useMemo(() => {
    return (
      networkState.effectiveType === "slow-2g" ||
      networkState.effectiveType === "2g" ||
      networkState.effectiveType === "3g" ||
      networkState.saveData
    );
  }, [networkState.effectiveType, networkState.saveData]);

  if (networkState.isOnline && !isSlowNetwork) {
    return null;
  }

  const isOffline = !networkState.isOnline;

  return (
    <div className="fixed inset-x-0 top-0 z-[120] px-3 pt-3">
      <div
        className={`mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur ${
          isOffline
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-amber-500/40 bg-amber-50 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <p>
            {isOffline
              ? "You're offline. Cached parts can still open, but live data may fail."
              : "Network is slow. Pages may load gradually; please wait a little longer."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => window.location.reload()}
        >
          <Wifi className="mr-1 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
};
