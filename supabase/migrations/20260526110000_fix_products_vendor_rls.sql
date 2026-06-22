-- Ensure vendors can reliably create/update/delete their own products,
-- while preserving admin management access.
DROP POLICY IF EXISTS "Shop owners can manage products" ON public.products;
DROP POLICY IF EXISTS "Shop owners and admins can manage products" ON public.products;

CREATE POLICY "Shop owners and admins can manage products"
ON public.products
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.shops
    WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
      AND public.has_role(auth.uid(), 'shop_owner'::app_role)
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.shops
    WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
      AND public.has_role(auth.uid(), 'shop_owner'::app_role)
  )
);
