import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

interface TrackVisitPayload {
  path?: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  device_type?: DeviceType;
  session_id?: string;
}

const SESSION_REGEX = /^[A-Za-z0-9_-]{8,128}$/;
const PATH_MAX_LENGTH = 512;
const TEXT_LIMIT = 2048;

const hashIp = async (ip: string) => {
  const encoded = new TextEncoder().encode(ip.trim());
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map((x) => x.toString(16).padStart(2, "0")).join("");
};

const normalizePath = (path: string) => {
  const raw = path.trim();
  if (!raw.startsWith("/")) throw new Error("path must start with '/'");
  if (raw.length > PATH_MAX_LENGTH) throw new Error("path exceeds maximum length");
  return raw;
};

const getDeviceType = (value?: string): DeviceType => {
  if (!value) return "unknown";
  if (["desktop", "mobile", "tablet", "bot", "unknown"].includes(value)) return value as DeviceType;
  return "unknown";
};

const cleanText = (value: unknown, maxLength = TEXT_LIMIT) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error("Missing required Supabase environment variables");
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const payload = (await req.json()) as TrackVisitPayload;
    if (!payload.path || !payload.session_id) {
      throw new Error("path and session_id are required");
    }
    if (!SESSION_REGEX.test(payload.session_id)) {
      throw new Error("Invalid session_id format");
    }

    const ipAddress = (
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      "0.0.0.0"
    );
    const ipHash = await hashIp(ipAddress);

    const path = normalizePath(payload.path);
    const referrer = cleanText(payload.referrer);
    const utmSource = cleanText(payload.utm_source, 128);
    const utmMedium = cleanText(payload.utm_medium, 128);
    const deviceType = getDeviceType(payload.device_type);

    const { data: userData } = await client.auth.getUser();
    const userId = userData.user?.id ?? null;

    const { count: recentHits, error: rateLimitError } = await admin
      .from("website_visits")
      .select("id", { head: true, count: "exact" })
      .eq("session_id", payload.session_id)
      .eq("ip_hash", ipHash)
      .gte("visited_at", new Date(Date.now() - 60 * 1000).toISOString());

    if (rateLimitError) throw rateLimitError;
    if ((recentHits || 0) >= 30) {
      return new Response(JSON.stringify({ ok: true, dropped: true, reason: "rate_limited" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await admin.from("website_visits").insert({
      path,
      referrer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      device_type: deviceType,
      user_id: userId,
      session_id: payload.session_id,
      ip_hash: ipHash,
      visited_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("track-visit error", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unexpected error",
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
