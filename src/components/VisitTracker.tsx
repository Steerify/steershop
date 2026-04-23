import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_STORAGE_KEY = "steershop_visit_session_id";

const buildSessionId = () => {
  const random = crypto.getRandomValues(new Uint8Array(16));
  const encoded = btoa(String.fromCharCode(...random)).replace(/[^A-Za-z0-9_-]/g, "");
  return encoded.slice(0, 24);
};

const getOrCreateSessionId = () => {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && /^[A-Za-z0-9_-]{8,128}$/.test(existing)) {
    return existing;
  }

  const generated = buildSessionId();
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
};

const resolveDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/bot|crawl|spider|slurp/.test(ua)) return "bot";
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
};

export const VisitTracker = () => {
  const location = useLocation();
  const lastTrackedRef = useRef<string | null>(null);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    const routeKey = `${location.pathname}${location.search}`;
    if (lastTrackedRef.current === routeKey) {
      return;
    }
    lastTrackedRef.current = routeKey;

    const urlParams = new URLSearchParams(location.search);
    const referrer = document.referrer || null;

    void supabase.functions.invoke("track-visit", {
      body: {
        path: routeKey,
        referrer,
        utm_source: urlParams.get("utm_source"),
        utm_medium: urlParams.get("utm_medium"),
        device_type: resolveDeviceType(),
        session_id: sessionId,
      },
    });
  }, [location.pathname, location.search, sessionId]);

  return null;
};
