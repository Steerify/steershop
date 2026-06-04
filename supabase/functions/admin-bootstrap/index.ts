// One-shot admin bootstrap: sets password & ensures admin role for a specific allowlisted email.
// Idempotent. Locked to a single email.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-secret",
};

const ALLOWED_EMAIL = "reginaomasoro56@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    if (email !== ALLOWED_EMAIL) {
      return new Response(JSON.stringify({ error: "Not allowed" }), { status: 403, headers: corsHeaders });
    }
    if (!password || password.length < 8) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Find user
    const { data: list, error: lerr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (lerr) throw lerr;
    const user = list.users.find((u) => u.email?.toLowerCase() === email);
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });

    const { error: uerr } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (uerr) throw uerr;

    await admin.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

    return new Response(JSON.stringify({ ok: true, user_id: user.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
