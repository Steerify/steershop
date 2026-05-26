import React, { useState, useEffect } from "react";
import { AlertTriangle, FileText, Info, X } from "lucide-react";

type Variant = "warning" | "legal" | "info";

export const NoticeBadge = ({
  variant = "legal",
  children,
  className = "",
  dismissible = false,
  storageKey = undefined,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  storageKey?: string;
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (dismissible && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored === "dismissed") {
        setIsDismissed(true);
      }
    }
  }, [dismissible, storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (storageKey) {
      localStorage.setItem(storageKey, "dismissed");
    }
  };

  if (isDismissed) return null;

  const base =
    "flex items-center gap-3 text-sm rounded-lg px-3 py-2 border shadow-sm";

  const variants: Record<Variant, string> = {
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    legal: "bg-muted/5 text-foreground border-border",
    info: "bg-sky-50 text-sky-800 border-sky-200",
  };

  const Icon =
    variant === "warning"
      ? AlertTriangle
      : variant === "info"
        ? Info
        : FileText;

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`.trim()}
      role="note"
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="leading-snug flex-1">{children}</div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NoticeBadge;
