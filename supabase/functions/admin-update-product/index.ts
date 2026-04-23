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

const allowedFields = new Set(["name", "description", "price", "stock_quantity", "is_available", "category", "type"]);
const allowedCategories = new Set(["fashion", "beauty", "food", "electronics", "home", "health", "other", "general"]);
const allowedTypes = new Set(["product", "service"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const headerError = assertDashboardMutationHeaders(req);
  if (headerError) {
    return new Response(JSON.stringify({ error: headerError }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId, adminClient } = await verifyAdminRequest(req);
    await enforceRateLimit(adminClient, userId, "admin-update-product", 40, 60);

    const payload = await req.json();
    const productId = sanitizeText(payload?.product_id, 64);
    const updates = payload?.updates;

    if (!productId || !updates || typeof updates !== "object") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const safeUpdates: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.has(key)) continue;

      if (key === "is_available") {
        if (typeof value === "boolean") safeUpdates[key] = value;
        continue;
      }

      if (key === "price" || key === "stock_quantity") {
        const parsed = Number(value);
        const isValidInt = Number.isFinite(parsed) && Number.isInteger(parsed);
        if (!isValidInt) continue;
        if (key === "price" && parsed <= 0) continue;
        if (key === "stock_quantity" && parsed < 0) continue;
        safeUpdates[key] = parsed;
        continue;
      }

      if (key === "category") {
        const category = sanitizeText(value, 32)?.toLowerCase();
        if (category && allowedCategories.has(category)) safeUpdates[key] = category;
        continue;
      }

      if (key === "type") {
        const type = sanitizeText(value, 16)?.toLowerCase();
        if (type && allowedTypes.has(type)) safeUpdates[key] = type;
        continue;
      }

      const sanitized = sanitizeText(value, key === "description" ? 1200 : 120);
      if (sanitized !== null) safeUpdates[key] = sanitized;
    }

    if (!Object.keys(safeUpdates).length) {
      return new Response(JSON.stringify({ error: "No valid update fields provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data, error } = await adminClient
      .from("products")
      .update(safeUpdates)
      .eq("id", productId)
      .select("id, name, is_available")
      .single();

    if (error) throw error;

    await writeAdminAudit(adminClient, userId, "admin_update_product", "products", productId, { changed_fields: Object.keys(safeUpdates) });
    await maybeWriteSecurityAlerts(adminClient, { adminId: userId, action: "admin_update_product", resourceType: "products" });

    return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: error instanceof Error && error.message === "Forbidden" ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
