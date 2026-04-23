-- Admin mutation hardening primitives
CREATE TABLE IF NOT EXISTS public.admin_mutation_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_mutation_rate_limits_lookup
  ON public.admin_mutation_rate_limits(admin_id, action, created_at DESC);

ALTER TABLE public.admin_mutation_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages admin mutation rate limits" ON public.admin_mutation_rate_limits;
CREATE POLICY "Service role manages admin mutation rate limits"
  ON public.admin_mutation_rate_limits
  FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

CREATE TABLE IF NOT EXISTS public.admin_security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN (
    'repeated_failed_admin_actions',
    'high_frequency_destructive_admin_actions'
  )),
  severity text NOT NULL CHECK (severity IN ('medium', 'high', 'critical')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_admin_security_alerts_created_at
  ON public.admin_security_alerts(created_at DESC);

ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security alerts" ON public.admin_security_alerts;
CREATE POLICY "Admins can view security alerts"
  ON public.admin_security_alerts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role inserts security alerts" ON public.admin_security_alerts;
CREATE POLICY "Service role inserts security alerts"
  ON public.admin_security_alerts
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "No updates on activity logs" ON public.activity_logs;
CREATE POLICY "No updates on activity logs"
  ON public.activity_logs
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No deletes on activity logs" ON public.activity_logs;
CREATE POLICY "No deletes on activity logs"
  ON public.activity_logs
  FOR DELETE
  USING (false);

-- Ensure core admin datasets remain inaccessible to non-admin users.
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_mutation_rate_limits ENABLE ROW LEVEL SECURITY;
