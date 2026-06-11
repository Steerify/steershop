-- SQL migration to create scheduled job for concierge_generate function (runs every 2 hours)
-- Ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job (runs at minute 0 of every 2nd hour)
SELECT cron.schedule('concierge_generate_2h', '0 */2 * * *', $$
  SELECT http_post(
    'https://YOUR_SUPABASE_PROJECT_REF.supabase.co/functions/v1/concierge-generate',
    '{}'::json
  );
$$);
