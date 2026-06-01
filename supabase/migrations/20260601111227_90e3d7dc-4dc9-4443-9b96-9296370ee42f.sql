-- ============ marketing_queue ============
CREATE TABLE public.marketing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  product_ids uuid[] DEFAULT '{}'::uuid[],
  caption text NOT NULL,
  image_url text,
  link_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  sent_by uuid,
  skipped_at timestamptz,
  skipped_by uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_marketing_queue_status ON public.marketing_queue(status, scheduled_for DESC);
CREATE INDEX idx_marketing_queue_shop ON public.marketing_queue(shop_id);

GRANT SELECT, UPDATE ON public.marketing_queue TO authenticated;
GRANT ALL ON public.marketing_queue TO service_role;

ALTER TABLE public.marketing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view marketing queue"
  ON public.marketing_queue FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update marketing queue"
  ON public.marketing_queue FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ marketing_metrics ============
CREATE TABLE public.marketing_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.marketing_queue(id) ON DELETE CASCADE,
  event text NOT NULL,         -- 'sent' | 'skipped' | 'click' | 'regenerated'
  shop_id uuid,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_marketing_metrics_post ON public.marketing_metrics(post_id);
CREATE INDEX idx_marketing_metrics_event ON public.marketing_metrics(event, created_at DESC);

GRANT INSERT ON public.marketing_metrics TO anon, authenticated;
GRANT SELECT ON public.marketing_metrics TO authenticated;
GRANT ALL ON public.marketing_metrics TO service_role;

ALTER TABLE public.marketing_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log click metrics"
  ON public.marketing_metrics FOR INSERT
  WITH CHECK (event = 'click');

CREATE POLICY "Admins log all metrics"
  ON public.marketing_metrics FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins view metrics"
  ON public.marketing_metrics FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ marketing-posts bucket ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing-posts', 'marketing-posts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Marketing posts publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketing-posts');

CREATE POLICY "Service role manages marketing posts"
  ON storage.objects FOR ALL
  USING (bucket_id = 'marketing-posts' AND ((auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (bucket_id = 'marketing-posts' AND ((auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin'::app_role)));

-- ============ enable cron + http for scheduling (idempotent) ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;