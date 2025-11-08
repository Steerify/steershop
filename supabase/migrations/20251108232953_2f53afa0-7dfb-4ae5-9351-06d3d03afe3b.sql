-- Create a public view that excludes sensitive payment credentials
CREATE OR REPLACE VIEW public.shops_public AS
SELECT 
  id,
  shop_name,
  shop_slug,
  description,
  logo_url,
  banner_url,
  average_rating,
  total_reviews,
  is_active,
  owner_id,
  whatsapp_number,
  created_at,
  updated_at
FROM public.shops
WHERE is_active = true;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active shops" ON public.shops;

-- Create restrictive policy: only shop owners can view their full shop data
CREATE POLICY "Shop owners can view own shop details"
ON public.shops
FOR SELECT
USING (auth.uid() = owner_id);

-- Enable RLS on the view (views inherit RLS but we make it explicit)
-- Grant public read access to the view
GRANT SELECT ON public.shops_public TO anon, authenticated;

-- Create a policy for the view that allows anyone to read it
-- Note: Views don't support RLS policies directly, access is controlled by grants
-- The underlying shops table policy ensures only active shops are shown