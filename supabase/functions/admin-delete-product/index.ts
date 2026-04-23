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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const headerError = assertDashboardMutationHeaders(req);
  if (headerError) {
    return new Response(JSON.stringify({ error: headerError }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId, adminClient } = await verifyAdminRequest(req);
    await enforceRateLimit(adminClient, userId, "admin-delete-product", 15, 60);

    const payload = await req.json();
    const productId = sanitizeText(payload?.product_id, 64);

    if (!productId) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { error } = await adminClient.from("products").delete().eq("id", productId);
    if (error) throw error;

    await writeAdminAudit(adminClient, userId, "admin_delete_product", "products", productId, {});
    await maybeWriteSecurityAlerts(adminClient, { adminId: userId, action: "admin_delete_product", resourceType: "products", destructive: true });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: error instanceof Error && error.message === "Forbidden" ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
