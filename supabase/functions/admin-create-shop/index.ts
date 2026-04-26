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
    await enforceRateLimit(adminClient, userId, "admin-create-shop", 15, 60);

    const payload = await req.json();
    const ownerId = sanitizeText(payload?.owner_id, 64);
    const shopName = sanitizeText(payload?.shop_name, 120);
    const shopSlug = sanitizeText(payload?.shop_slug, 120);
    const description = sanitizeText(payload?.description, 1000);
    const whatsappNumber = sanitizeText(payload?.whatsapp_number, 40);
    const isActive = payload?.is_active === false ? false : true;

    if (!ownerId || !shopName || !shopSlug) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data, error } = await adminClient
      .from("shops")
      .insert({
        owner_id: ownerId,
        shop_name: shopName,
        shop_slug: shopSlug,
        description: description || null,
        whatsapp_number: whatsappNumber || null,
        is_active: isActive,
      })
      .select("id, shop_name, shop_slug, owner_id, is_active")
      .single();

    if (error) throw error;

    await writeAdminAudit(adminClient, userId, "admin_create_shop", "shops", data.id, {
      owner_id: ownerId,
      shop_slug: shopSlug,
    });
    await maybeWriteSecurityAlerts(adminClient, { adminId: userId, action: "admin_create_shop", resourceType: "shops" });

    return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), {
      status: error instanceof Error && error.message === "Forbidden" ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
