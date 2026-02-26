
-- Create google_business_profiles table
CREATE TABLE public.google_business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  consent_given_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  business_name text,
  physical_address text,
  is_service_area_business boolean DEFAULT false,
  service_areas text,
  primary_category text,
  phone_number text,
  website_url text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  business_description text,
  services_list text,
  attributes text[] DEFAULT '{}',
  opening_date text,
  logo_url text,
  cover_photo_url text,
  interior_photos text[] DEFAULT '{}',
  exterior_photos text[] DEFAULT '{}',
  team_photos text[] DEFAULT '{}',
  verification_notes text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_business_profiles ENABLE ROW LEVEL SECURITY;

-- Shop owners can CRUD their own submissions
CREATE POLICY "Owners can view own GBP submissions"
  ON public.google_business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert own GBP submissions"
  ON public.google_business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own GBP submissions"
  ON public.google_business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete own GBP drafts"
  ON public.google_business_profiles FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Admins can view all
CREATE POLICY "Admins can view all GBP submissions"
  ON public.google_business_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all GBP submissions"
  ON public.google_business_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_google_business_profiles_updated_at
  BEFORE UPDATE ON public.google_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Validation trigger for status
CREATE OR REPLACE FUNCTION public.validate_gbp_submission()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'submitted' AND NOT NEW.consent_given THEN
    RAISE EXCEPTION 'Consent must be given before submitting';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_gbp_before_update
  BEFORE INSERT OR UPDATE ON public.google_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_gbp_submission();
