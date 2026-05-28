-- Add delete_at column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delete_at TIMESTAMPTZ DEFAULT NULL;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule first if it exists, to prevent duplicates.
-- Guarded: cron.unschedule() raises if the job is absent, which would abort
-- this whole migration and roll back the ALTER TABLE above.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delete_expired_products_cron') THEN
    PERFORM cron.unschedule('delete_expired_products_cron');
  END IF;
END$$;

-- Schedule product self-deletion check every 5 minutes
-- Deletes products that have passed their scheduled deletion time
SELECT cron.schedule(
  'delete_expired_products_cron',
  '*/5 * * * *',
  $$DELETE FROM public.products WHERE delete_at IS NOT NULL AND delete_at <= NOW()$$
);

-- Refresh PostgREST schema cache so the new column is visible to the API
NOTIFY pgrst, 'reload schema';
