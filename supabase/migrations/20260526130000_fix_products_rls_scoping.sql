-- ============================================================
-- Fix: Remove explicit table prefix "products.shop_id" in EXISTS
-- Postgres RLS can sometimes mask the NEW/OLD record when 
-- explicitly prefixed inside an EXISTS subquery.
-- We use just "shop_id" which cleanly maps to the NEW/OLD row.
-- ============================================================

DROP POLICY IF EXISTS "Vendors can insert own products"        ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products"        ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products"        ON public.products;

-- INSERT policy
CREATE POLICY "Vendors can insert own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = shop_id 
    AND owner_id = auth.uid()
  )
);

-- UPDATE policy
CREATE POLICY "Vendors can update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = shop_id 
    AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = shop_id 
    AND owner_id = auth.uid()
  )
);

-- DELETE policy
CREATE POLICY "Vendors can delete own products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE id = shop_id 
    AND owner_id = auth.uid()
  )
);

NOTIFY pgrst, 'reload schema';
