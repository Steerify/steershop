-- Create a trigger function to send an email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- We use pg_net to invoke the edge function.
  -- Make sure pg_net is enabled in your database extensions.
  
  -- Alternatively, we can use a simpler approach by calling the edge function asynchronously 
  -- but pg_net is required for making HTTP requests from Postgres.
  
  PERFORM net.http_post(
      url:='https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/functions/v1/send-notification-email',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR_ANON_OR_SERVICE_ROLE_KEY]"}'::jsonb,
      body:=json_build_object(
          'type', 'signup_success',
          'user_id', NEW.id,
          'data', json_build_object(
              'dashboardUrl', 'https://steersolo.com/dashboard',
              'name', NEW.raw_user_meta_data->>'full_name'
          )
      )::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_send_email ON auth.users;
CREATE TRIGGER on_auth_user_created_send_email
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_signup();
