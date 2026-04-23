import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Wifi, WifiOff, X } from "lucide-react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const previousStatusRef = useRef<"offline" | "slow" | "connected">("connected");

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

  const status: "offline" | "slow" | "connected" = !networkState.isOnline
    ? "offline"
    : isSlowNetwork
      ? "slow"
      : "connected";

  useEffect(() => {
    const previous = previousStatusRef.current;
    const shouldShow = status !== "connected" || previous !== "connected";
    previousStatusRef.current = status;

    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timeout = window.setTimeout(() => setIsVisible(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  if (!isVisible) return null;

  const bannerClasses =
    status === "offline"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : status === "slow"
        ? "border-amber-500/40 bg-amber-50 text-amber-900"
        : "border-emerald-500/40 bg-emerald-50 text-emerald-900";

  const bannerText =
    status === "offline"
      ? "Offline"
      : status === "slow"
        ? "Network is slow"
        : "Connected";

  return (
    <div
      className="fixed inset-x-0 top-0 z-[120] px-3 pt-3"
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStartX === null) return;
        const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
        if (Math.abs(touchEndX - touchStartX) > 60) {
          setIsVisible(false);
        }
        setTouchStartX(null);
      }}
    >
      <div
        className={`mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur ${bannerClasses}`}
      >
        <div className="flex items-center gap-2">
          {status === "offline" ? (
            <WifiOff className="h-4 w-4" />
          ) : status === "slow" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          <p>{bannerText}</p>
        </div>

        <button
          type="button"
          aria-label="Dismiss network banner"
          className="rounded-md p-1 opacity-80 transition hover:opacity-100"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
