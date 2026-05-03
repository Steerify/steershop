-- 1. Add missing columns referenced by paystack-verify and paystack-webhook
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.orders   ADD COLUMN IF NOT EXISTS payment_instrument_fingerprint text;

CREATE INDEX IF NOT EXISTS idx_profiles_payment_reference ON public.profiles(payment_reference);

-- 2. Create website_visits table (was being written to by track-visit edge function)
CREATE TABLE IF NOT EXISTS public.website_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path        text NOT NULL,
  referrer    text,
  utm_source  text,
  utm_medium  text,
  device_type text,
  user_id     uuid,
  session_id  text NOT NULL,
  ip_hash     text,
  visited_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_website_visits_visited_at ON public.website_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_website_visits_session    ON public.website_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_website_visits_path       ON public.website_visits(path);

ALTER TABLE public.website_visits ENABLE ROW LEVEL SECURITY;

-- Admins can read; service role inserts via edge function (bypasses RLS automatically).
CREATE POLICY "Admins can view website visits"
  ON public.website_visits FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role inserts visits"
  ON public.website_visits FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');