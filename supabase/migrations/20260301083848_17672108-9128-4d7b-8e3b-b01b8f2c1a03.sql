
-- ============================================================
-- SECURITY FIX 1: deleted_accounts — restrict to service role only
-- ============================================================
CREATE POLICY "Only service role can manage deleted accounts"
  ON public.deleted_accounts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- SECURITY FIX 2: platform_earnings INSERT — restrict to service role
-- (Drop the overly permissive "true" INSERT policy)
-- ============================================================
DROP POLICY IF EXISTS "System can insert earnings" ON public.platform_earnings;

CREATE POLICY "Service role inserts earnings"
  ON public.platform_earnings
  FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- BATCH 2: Add compare_price column for discount pricing
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_price numeric NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.products.compare_price IS 'Original/compare-at price shown with strikethrough. Actual selling price is in the price column.';
