import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  assertDashboardMutationHeaders,
  corsHeaders,
  enforceRateLimit,
  maybeWriteSecurityAlerts,
  sanitizeText,
  verifyAdminRequest,
  writeAdminAudit,
} from "../_shared/admin-security.ts";

const allowedActions = new Set(["extend_days", "set_date", "activate"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const headerError = assertDashboardMutationHeaders(req);
  if (headerError) {
    return new Response(JSON.stringify({ error: headerError }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId: adminId, adminClient } = await verifyAdminRequest(req);
    await enforceRateLimit(adminClient, adminId, "admin-set-subscription", 20, 60);

    const payload = await req.json();
    const userId = sanitizeText(payload?.user_id, 64);
    const action = sanitizeText(payload?.action, 32);
    const planId = sanitizeText(payload?.plan_id, 64);
    const planName = sanitizeText(payload?.plan_name, 80);

    if (!userId || !action || !allowedActions.has(action)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("subscription_expires_at")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    const now = new Date();
    let newExpiry: Date;
    let eventType = "extension";
    let notes = "Updated by admin";

    if (action === "extend_days") {
      const days = Number(payload?.days);
      if (!Number.isInteger(days) || days < 1 || days > 3650) {
        return new Response(JSON.stringify({ error: "Invalid days" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const current = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : now;
      const base = current > now ? current : now;
      newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      notes = `Extended by ${days} days by admin`;
    } else if (action === "set_date") {
      const customDateRaw = sanitizeText(payload?.custom_date, 40);
      if (!customDateRaw) {
        return new Response(JSON.stringify({ error: "Invalid custom date" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      newExpiry = new Date(customDateRaw);
      if (Number.isNaN(newExpiry.getTime())) {
        return new Response(JSON.stringify({ error: "Invalid custom date" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      notes = "Extended to custom date by admin";
    } else {
      newExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      eventType = "activation";
      notes = "Activated by admin";
    }

    const updateData: Record<string, unknown> = {
      is_subscribed: true,
      subscription_expires_at: newExpiry.toISOString(),
    };

    if (action === "activate" && planId) {
      updateData.subscription_plan_id = planId;
    }

    const { error: updateError } = await adminClient.from("profiles").update(updateData).eq("id", userId);
    if (updateError) throw updateError;

    const { error: historyError } = await adminClient.from("subscription_history").insert({
      user_id: userId,
      event_type: eventType,
      plan_id: action === "activate" ? planId ?? null : null,
      plan_name: planName ?? null,
      previous_expiry_at: profile.subscription_expires_at,
      new_expiry_at: newExpiry.toISOString(),
      notes,
      created_by: adminId,
    });

    if (historyError) throw historyError;

    await writeAdminAudit(adminClient, adminId, "admin_set_subscription", "profiles", userId, {
      action,
      new_expiry_at: newExpiry.toISOString(),
      plan_id: planId,
    });
    await maybeWriteSecurityAlerts(adminClient, { adminId, action: "admin_set_subscription", resourceType: "profiles" });

    return new Response(JSON.stringify({ success: true, new_expiry_at: newExpiry.toISOString() }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: error instanceof Error && error.message === "Forbidden" ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
