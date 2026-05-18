-- Add delete_at column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delete_at TIMESTAMPTZ DEFAULT NULL;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule first if exists to prevent duplicates
SELECT cron.unschedule('delete_expired_products_cron');

-- Schedule product self-deletion check every 5 minutes
-- Deletes products that have passed their scheduled deletion time
SELECT cron.schedule(
  'delete_expired_products_cron',
  '*/5 * * * *',
  $$DELETE FROM public.products WHERE delete_at IS NOT NULL AND delete_at <= NOW()$$
);
