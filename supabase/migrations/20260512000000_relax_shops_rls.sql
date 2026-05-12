-- Relax shops RLS policies to allow admins to manage shops
-- This fixes the issue where administrative users could not test the onboarding flow

-- 1. Update INSERT policy
DROP POLICY IF EXISTS "Shop owners can create shops" ON public.shops;
CREATE POLICY "Shop owners and admins can create shops"
ON public.shops
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  (
    public.has_role(auth.uid(), 'shop_owner'::app_role) OR
    public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 2. Update UPDATE policy
DROP POLICY IF EXISTS "Shop owners can update own shops" ON public.shops;
CREATE POLICY "Shop owners and admins can update shops"
ON public.shops
FOR UPDATE
USING (
  auth.uid() = owner_id OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Update DELETE policy (if exists)
DROP POLICY IF EXISTS "Shop owners can delete own shops" ON public.shops;
CREATE POLICY "Shop owners and admins can delete shops"
ON public.shops
FOR DELETE
USING (
  auth.uid() = owner_id OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
