
-- Add missing ambassador columns
ALTER TABLE public.ambassador_profiles
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS compliance_notes text,
  ADD COLUMN IF NOT EXISTS enrollment_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS enrolled_at timestamptz NOT NULL DEFAULT now();

-- Admin-only website visit analytics RPC
CREATE OR REPLACE FUNCTION public.get_website_visit_analytics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_today integer;
  v_7d integer;
  v_30d integer;
  v_top_pages jsonb;
  v_daily jsonb;
  v_table_exists boolean;
BEGIN
  v_uid := auth.uid();
  IF NOT public.has_role(v_uid, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'website_visits'
  ) INTO v_table_exists;

  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'totals', jsonb_build_object('today', 0, 'days7', 0, 'days30', 0),
      'top_pages', '[]'::jsonb,
      'daily', '[]'::jsonb
    );
  END IF;

  EXECUTE 'SELECT count(*) FROM public.website_visits WHERE created_at >= current_date' INTO v_today;
  EXECUTE 'SELECT count(*) FROM public.website_visits WHERE created_at >= now() - interval ''7 days''' INTO v_7d;
  EXECUTE 'SELECT count(*) FROM public.website_visits WHERE created_at >= now() - interval ''30 days''' INTO v_30d;

  EXECUTE $sql$
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) FROM (
      SELECT path, count(*)::int AS visits
      FROM public.website_visits
      WHERE created_at >= now() - interval '30 days'
      GROUP BY path
      ORDER BY visits DESC
      LIMIT 10
    ) t
  $sql$ INTO v_top_pages;

  EXECUTE $sql$
    SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY day), '[]'::jsonb) FROM (
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, count(*)::int AS visits
      FROM public.website_visits
      WHERE created_at >= now() - interval '30 days'
      GROUP BY 1
    ) t
  $sql$ INTO v_daily;

  RETURN jsonb_build_object(
    'totals', jsonb_build_object('today', v_today, 'days7', v_7d, 'days30', v_30d),
    'top_pages', v_top_pages,
    'daily', v_daily
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_website_visit_analytics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_website_visit_analytics() TO authenticated;
