// Public click-tracking redirect: GET /concierge-click?post=<id>&to=<url>
// Logs an anonymous metric then 302s to the target URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("post");
    let to = url.searchParams.get("to") || "https://steersolo.com/";

    // Whitelist: only redirect to steersolo.com
    try {
      const u = new URL(to);
      if (!u.hostname.endsWith("steersolo.com") && !u.hostname.endsWith("lovable.app")) {
        to = "https://steersolo.com/";
      }
    } catch {
      to = "https://steersolo.com/";
    }

    if (postId) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await admin.from("marketing_metrics").insert({
        post_id: postId,
        event: "click",
        meta: {
          ua: req.headers.get("user-agent")?.slice(0, 200) || null,
          ref: req.headers.get("referer") || null,
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: to },
    });
  } catch (e) {
    console.error("concierge-click error", e);
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: "https://steersolo.com/" },
    });
  }
});
