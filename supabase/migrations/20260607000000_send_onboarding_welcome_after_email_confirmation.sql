-- Queue the supplemental onboarding welcome only after a user's email has
-- been confirmed. The signup auth email hook should send the verification
-- email to the user, while this trigger handles the post-confirmation welcome.

CREATE OR REPLACE FUNCTION public.queue_onboarding_welcome_after_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pgmq
AS $$
DECLARE
  metadata jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  role text := COALESCE(NULLIF(metadata->>'role', ''), 'unknown');
  full_name text := COALESCE(NULLIF(btrim(metadata->>'full_name'), ''), 'there');
  escaped_name text;
  site_url text := 'https://steersolo.com';
  cta_url text;
  cta_label text;
  next_step text;
  subject text;
  html_body text;
  text_body text;
  message_id uuid := gen_random_uuid();
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fire exactly when an existing auth user transitions from unconfirmed to
  -- confirmed. Users who were already confirmed must not get duplicate welcomes.
  IF OLD.email_confirmed_at IS NOT NULL OR NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Avoid duplicate welcome jobs if the trigger is recreated or the same user is
  -- updated again by a migration/backfill before the queue is processed.
  IF EXISTS (
    SELECT 1
    FROM public.email_send_log
    WHERE template_name = 'onboarding_welcome_confirmed'
      AND recipient_email = NEW.email
      AND metadata @> jsonb_build_object('user_id', NEW.id::text)
      AND status IN ('pending', 'sent')
  ) THEN
    RETURN NEW;
  END IF;

  IF role = 'shop_owner' THEN
    subject := 'Welcome to SteerSolo — Complete your onboarding';
    cta_url := site_url || '/onboarding';
    cta_label := 'Complete Onboarding';
    next_step := 'Complete your onboarding to start selling.';
  ELSE
    subject := 'Welcome to SteerSolo — Start exploring stores';
    cta_url := site_url || '/shops';
    cta_label := 'Explore Stores';
    next_step := 'You can now browse trusted stores.';
  END IF;

  escaped_name := replace(replace(replace(replace(replace(full_name, '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;');

  html_body := format(
    '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 16px;">'
      || '<h2 style="margin: 0 0 10px; color: #123C72;">Welcome to SteerSolo, %s 👋</h2>'
      || '<p style="margin: 0 0 14px; color: #475467;">Your email is confirmed. %s</p>'
      || '<a href="%s" style="display:inline-block;background:#123C72;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">%s</a>'
      || '</div>',
    escaped_name,
    next_step,
    cta_url,
    cta_label
  );

  text_body := 'Welcome! Your email is confirmed. Next step: ' || cta_url;

  BEGIN
    PERFORM pgmq.send(
      'transactional_emails',
      jsonb_build_object(
        'message_id', message_id::text,
        'label', 'onboarding_welcome_confirmed',
        'to', NEW.email,
        'from', 'SteerSolo <mail@steersolo.com>',
        'replyTo', 'mail@steersolo.com',
        'subject', subject,
        'html', html_body,
        'text', text_body,
        'queued_at', now()
      )
    );
  EXCEPTION WHEN undefined_table THEN
    PERFORM pgmq.create('transactional_emails');
    PERFORM pgmq.send(
      'transactional_emails',
      jsonb_build_object(
        'message_id', message_id::text,
        'label', 'onboarding_welcome_confirmed',
        'to', NEW.email,
        'from', 'SteerSolo <mail@steersolo.com>',
        'replyTo', 'mail@steersolo.com',
        'subject', subject,
        'html', html_body,
        'text', text_body,
        'queued_at', now()
      )
    );
  END;

  INSERT INTO public.email_send_log (
    message_id,
    template_name,
    recipient_email,
    status,
    metadata
  ) VALUES (
    message_id::text,
    'onboarding_welcome_confirmed',
    NEW.email,
    'pending',
    jsonb_build_object(
      'user_id', NEW.id::text,
      'role', role,
      'source', 'auth_users_email_confirmation_trigger'
    )
  );

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.queue_onboarding_welcome_after_email_confirmation() FROM PUBLIC;

DROP TRIGGER IF EXISTS queue_onboarding_welcome_after_email_confirmation ON auth.users;

CREATE TRIGGER queue_onboarding_welcome_after_email_confirmation
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.queue_onboarding_welcome_after_email_confirmation();
