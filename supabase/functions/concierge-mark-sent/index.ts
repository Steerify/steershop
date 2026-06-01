// Admin-only: flips a queued post to 'sent' or 'skipped' and logs a metric.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) return new Response("Forbidden", { status: 403, headers: corsHeaders });

    const body = await req.json();
    const { post_id, action } = body;
    if (!post_id || !["sent", "skipped"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const patch =
      action === "sent"
        ? { status: "sent", sent_at: new Date().toISOString(), sent_by: userId }
        : { status: "skipped", skipped_at: new Date().toISOString(), skipped_by: userId };

    const { data: post, error } = await adminClient
      .from("marketing_queue")
      .update(patch)
      .eq("id", post_id)
      .select()
      .single();
    if (error) throw error;

    await adminClient.from("marketing_metrics").insert({
      post_id,
      event: action,
      shop_id: post?.shop_id ?? null,
      meta: { actor: userId },
    });

    return new Response(JSON.stringify({ ok: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("concierge-mark-sent error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
