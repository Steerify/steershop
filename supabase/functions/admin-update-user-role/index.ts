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

const allowedRoles = new Set(["customer", "shop_owner", "admin"]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const headerError = assertDashboardMutationHeaders(req);
  if (headerError) {
    return new Response(JSON.stringify({ error: headerError }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { userId: adminId, adminClient } = await verifyAdminRequest(req);
    await enforceRateLimit(adminClient, adminId, "admin-update-user-role", 20, 60);

    const payload = await req.json();
    const userId = sanitizeText(payload?.user_id, 64);
    const role = sanitizeText(payload?.role, 32);

    if (!userId || !role || !allowedRoles.has(role)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data, error } = await adminClient
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select("id, role")
      .single();

    if (error) throw error;

    const { error: cleanupRolesError } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .neq("role", role);

    if (cleanupRolesError) throw cleanupRolesError;

    const { error: syncRoleError } = await adminClient
      .from("user_roles")
      .upsert({
        user_id: userId,
        role,
      }, { onConflict: "user_id,role" });

    if (syncRoleError) throw syncRoleError;

    await writeAdminAudit(adminClient, adminId, "admin_update_user_role", "profiles", userId, { role });
    await maybeWriteSecurityAlerts(adminClient, { adminId, action: "admin_update_user_role", resourceType: "profiles" });

    return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: error instanceof Error && error.message === "Forbidden" ? 403 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
