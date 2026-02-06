
-- Create deleted_accounts table
CREATE TABLE public.deleted_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS with no public access
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- Block deleted emails from re-registering
CREATE OR REPLACE FUNCTION public.block_deleted_email()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.deleted_accounts 
    WHERE email = NEW.email
  ) THEN
    RAISE EXCEPTION 'This email address has been permanently blocked.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_deleted_email
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.block_deleted_email();
