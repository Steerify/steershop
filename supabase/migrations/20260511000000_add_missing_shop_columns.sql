-- Add missing columns to shops table that were used in application code
-- but were never added via a migration

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'Nigeria',
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_engagement_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_shares integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_views integer DEFAULT 0;

-- Refresh the schema cache so PostgREST picks up the new columns
NOTIFY pgrst, 'reload schema';
