
-- SECURITY FIX 3: activity_logs INSERT — restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- SECURITY FIX 4: Fix mutable search_path on update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
