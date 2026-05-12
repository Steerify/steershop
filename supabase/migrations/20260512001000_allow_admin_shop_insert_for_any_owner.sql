-- Allow admins to create shops for any valid owner while preserving owner self-service checks.
DROP POLICY IF EXISTS "Shop owners and admins can create shops" ON public.shops;

CREATE POLICY "Shop owners and admins can create shops"
ON public.shops
FOR INSERT
WITH CHECK (
  (
    auth.uid() = owner_id AND
    public.has_role(auth.uid(), 'shop_owner'::app_role)
  ) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

NOTIFY pgrst, 'reload schema';
