-- ============================================================
-- Schedule Email Queue Processing
-- ============================================================
-- This migration sets up the pg_cron job to process email queues
-- and prepares the vault secret for the service role key.
-- ============================================================

-- Ensure pg_cron is loaded (just in case previous migrations didn't run)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;

-- ============================================================
-- 1. VAULT SECRET PREPARATION (PLACEHOLDER)
-- ============================================================
-- NOTE: This is a placeholder. You MUST insert your actual service role key
-- via the Supabase Dashboard → Vault → Secrets or via SQL Editor!
-- The service role key can be found in Supabase Dashboard → Settings → API
--
-- Example command to insert/update (run this in SQL Editor after deploying migration):
--
-- DO $$
-- BEGIN
--   -- Try to create, if fails, update
--   PERFORM vault.create_secret(
--     'YOUR_SERVICE_ROLE_KEY_HERE', -- Replace this!
--     'email_queue_service_role_key',
--     'Service role key for email queue processing'
--   );
-- EXCEPTION
--   WHEN unique_violation THEN
--     UPDATE vault.secrets
--     SET secret = 'YOUR_SERVICE_ROLE_KEY_HERE' -- Replace this!
--     WHERE name = 'email_queue_service_role_key';
-- END $$;
--
-- ============================================================

-- ============================================================
-- 2. PG_CRON JOB TO PROCESS EMAIL QUEUE
-- ============================================================
-- First, unschedule any existing job to ensure idempotency
DO $$ BEGIN
  PERFORM cron.unschedule('process-email-queue');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Schedule the job to run every 10 seconds (adjust interval as needed)
SELECT cron.schedule(
  'process-email-queue', -- Job name
  '10 seconds', -- Schedule interval
  $$
    -- Only run if we're not in rate-limit cooldown
    -- and there are messages in either queue
    DO $$
    DECLARE
      v_service_role_key TEXT;
      v_retry_until TIMESTAMPTZ;
      v_has_messages BOOLEAN;
    BEGIN
      -- Get the service role key from vault
      SELECT secret INTO v_service_role_key
      FROM vault.secrets
      WHERE name = 'email_queue_service_role_key'
      LIMIT 1;

      IF v_service_role_key IS NULL THEN
        RAISE LOG 'No service role key found in vault; skipping email queue processing';
        RETURN;
      END IF;

      -- Check rate limit cooldown
      SELECT retry_after_until INTO v_retry_until
      FROM public.email_send_state
      WHERE id = 1;

      IF v_retry_until IS NOT NULL AND v_retry_until > NOW() THEN
        RAISE LOG 'In rate-limit cooldown until %; skipping email queue processing', v_retry_until;
        RETURN;
      END IF;

      -- Check if any queues have pending messages
      SELECT EXISTS(
        SELECT 1 FROM pgmq.queue_auth_emails
        UNION ALL
        SELECT 1 FROM pgmq.queue_transactional_emails
      ) INTO v_has_messages;

      IF NOT v_has_messages THEN
        RAISE LOG 'No messages in queues; skipping email queue processing';
        RETURN;
      END IF;

      -- Call process-email-queue edge function
      -- Project ref: hwkcqgmtinbgyjjgcgmp (from the plan)
      PERFORM
        net.http_post(
          url := 'https://hwkcqgmtinbgyjjgcgmp.supabase.co/functions/v1/process-email-queue',
          headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_service_role_key,
            'Content-Type', 'application/json'
          ),
          body := '{}'::jsonb
        );
    END $$;
  $$
);
