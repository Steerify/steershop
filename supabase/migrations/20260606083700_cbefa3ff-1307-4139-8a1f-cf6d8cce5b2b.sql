
-- Swap concierge cron from every 2h to hourly so Foundry (7,13,19) and Vendor (7,13,19) slots fire
DO $$
DECLARE jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'concierge-generate-every-2h';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'concierge-generate-hourly';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END $$;

SELECT cron.schedule(
  'concierge-generate-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/concierge-generate',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3a2NxZ210aW5iZ3lqamdjZ21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzg2NDMsImV4cCI6MjA3ODIxNDY0M30.DteckGKDVYtq-fwPn24qgas0qg9CKOswAPkZuigre2U"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
