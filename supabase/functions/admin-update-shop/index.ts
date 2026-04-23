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

const allowedFields = new Set(["shop_name", "description", "whatsapp_number", "is_active"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const headerError = assertDashboardMutationHeaders(req);
  if (headerError) {
    return new Response(JSON.stringify({ error: headerError }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId, adminClient } = await verifyAdminRequest(req);
    await enforceRateLimit(adminClient, userId, "admin-update-shop", 30, 60);

    const payload = await req.json();
    const shopId = sanitizeText(payload?.shop_id, 64);
    const updates = payload?.updates;

    if (!shopId || !updates || typeof updates !== "object") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const safeUpdates: Record<string, string | boolean> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.has(key)) continue;
      if (key === "is_active") {
        if (typeof value === "boolean") safeUpdates[key] = value;
        continue;
      }
      const sanitized = sanitizeText(value, key === "description" ? 1000 : 120);
      if (sanitized !== null) safeUpdates[key] = sanitized;
    }

    if (!Object.keys(safeUpdates).length) {
      return new Response(JSON.stringify({ error: "No valid update fields provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data, error } = await adminClient
      .from("shops")
      .update(safeUpdates)
      .eq("id", shopId)
      .select("id, shop_name, is_active")
      .single();

    if (error) throw error;

    await writeAdminAudit(adminClient, userId, "admin_update_shop", "shops", shopId, { changed_fields: Object.keys(safeUpdates) });
    await maybeWriteSecurityAlerts(adminClient, { adminId: userId, action: "admin_update_shop", resourceType: "shops" });

    return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: error instanceof Error && error.message === "Forbidden" ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
