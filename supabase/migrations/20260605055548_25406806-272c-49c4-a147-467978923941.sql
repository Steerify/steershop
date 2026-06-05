-- Register auth-email-hook as Supabase Auth's Send Email Hook so all
-- signup/recovery/magic-link/email-change/reauth emails go through our
-- Resend-backed edge function instead of Supabase's default sender.
-- Idempotent: safe to re-run.

DO $$
DECLARE
  v_project_ref text := 'hwkcqgmtinbgyjjgcgmp';
  v_hook_uri text;
  v_secret text;
BEGIN
  v_hook_uri := 'https://' || v_project_ref || '.supabase.co/functions/v1/auth-email-hook';

  -- Pull the existing WEBHOOK_SECRET from Vault if available; otherwise leave secret blank
  -- (Supabase Auth will still call the hook URL — the function itself validates the header).
  BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'WEBHOOK_SECRET'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_secret := NULL;
  END;

  -- Best-effort: update auth.config if the row exists.
  BEGIN
    UPDATE auth.config
       SET hook_send_email_enabled = true,
           hook_send_email_uri = v_hook_uri,
           hook_send_email_secrets = COALESCE('v1,whsec_' || v_secret, hook_send_email_secrets)
     WHERE true;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'auth.config not writable from migration: %', SQLERRM;
  END;
END$$;