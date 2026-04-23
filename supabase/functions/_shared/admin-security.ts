import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-intent",
};

export type AdminContext = {
  userId: string;
  adminClient: ReturnType<typeof createClient>;
};

const MAX_FIELD_LENGTH = 500;

export const sanitizeText = (value: unknown, maxLength = MAX_FIELD_LENGTH): string | null => {
  if (typeof value !== "string") return null;
  const withoutControls = [...value].filter((char) => {
    const code = char.charCodeAt(0);
    return code >= 32 && code !== 127;
  }).join('');
  return withoutControls.trim().slice(0, maxLength);
};

export const assertDashboardMutationHeaders = (req: Request): string | null => {
  if (req.method !== "POST") return "Method not allowed";

  const adminIntent = req.headers.get("x-admin-intent");
  if (adminIntent !== "dashboard-mutation") {
    return "Missing required admin mutation header";
  }

  const configuredOrigin = Deno.env.get("APP_ORIGIN")?.trim();
  const requestOrigin = req.headers.get("origin");
  if (configuredOrigin && requestOrigin && configuredOrigin !== requestOrigin) {
    return "Invalid origin";
  }

  return null;
};

export const verifyAdminRequest = async (req: Request): Promise<AdminContext> => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.slice("Bearer ".length);
  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin, error: roleError } = await adminClient.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });

  if (roleError || !isAdmin) {
    await adminClient.from("activity_logs").insert({
      user_id: userData.user.id,
      action_type: "admin_unauthorized_attempt",
      resource_type: "admin_endpoint",
      metadata: { path: new URL(req.url).pathname },
    });
    throw new Error("Forbidden");
  }

  return { userId: userData.user.id, adminClient };
};

export const enforceRateLimit = async (
  adminClient: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  maxAttempts = 20,
  windowSeconds = 60,
) => {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await adminClient
    .from("admin_mutation_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("admin_id", adminId)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (error) throw new Error("Rate limit check failed");
  if ((count ?? 0) >= maxAttempts) {
    throw new Error("Rate limit exceeded");
  }

  const { error: insertError } = await adminClient.from("admin_mutation_rate_limits").insert({
    admin_id: adminId,
    action,
  });

  if (insertError) throw new Error("Rate limit update failed");
};

export const writeAdminAudit = async (
  adminClient: ReturnType<typeof createClient>,
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown>,
) => {
  const { error } = await adminClient.from("activity_logs").insert({
    user_id: adminId,
    action_type: action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });

  if (error) throw new Error(`Audit log failed: ${error.message}`);
};

export const maybeWriteSecurityAlerts = async (
  adminClient: ReturnType<typeof createClient>,
  params: { adminId: string; action: string; resourceType: string; destructive?: boolean },
) => {
  const { adminId, action, resourceType, destructive = false } = params;
  const last15Mins = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { count: failedCount } = await adminClient
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", adminId)
    .eq("action_type", "admin_unauthorized_attempt")
    .gte("created_at", last15Mins);

  if ((failedCount ?? 0) >= 5) {
    await adminClient.from("admin_security_alerts").insert({
      alert_type: "repeated_failed_admin_actions",
      severity: "high",
      details: { admin_id: adminId, failed_count: failedCount },
    });
  }

  if (destructive) {
    const { count: destructiveCount } = await adminClient
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", adminId)
      .in("action_type", ["admin_delete_shop", "admin_delete_product"])
      .gte("created_at", last15Mins);

    if ((destructiveCount ?? 0) >= 10) {
      await adminClient.from("admin_security_alerts").insert({
        alert_type: "high_frequency_destructive_admin_actions",
        severity: "critical",
        details: { admin_id: adminId, destructive_count: destructiveCount, action, resource_type: resourceType },
      });
    }
  }
};
