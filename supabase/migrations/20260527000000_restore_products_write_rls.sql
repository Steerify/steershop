-- ============================================================
-- Restore product write RLS for shop owners (CRUD fix)
--
-- Background:
--   A prior "redo" change deleted the migrations that fixed product
--   write permissions, which can leave vendors unable to INSERT /
--   UPDATE / DELETE their own products (PostgREST 42501 / RLS errors).
--
-- This migration is idempotent and re-establishes a known-good state:
--   * RLS enabled on public.products
--   * explicit INSERT / UPDATE / DELETE policies scoped TO authenticated
--   * admins retain full access
--   * read (SELECT) policies are left untouched
--
-- Note on the EXISTS subquery:
--   We intentionally reference the bare column `shop_id` (the NEW/OLD
--   products row) rather than `products.shop_id`. Postgres can mask the
--   pending row when the outer table is explicitly qualified inside an
--   EXISTS used by an INSERT WITH CHECK, so the bare form is more
--   reliable. `id` / `owner_id` resolve to the inner `shops` table.
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Clean slate for write policies (do NOT drop SELECT/read policies)
DROP POLICY IF EXISTS "Shop owners can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products"  ON public.products;
DROP POLICY IF EXISTS "Vendors can insert own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products" ON public.products;

-- 2. INSERT - shop owners can create products for their own shop
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

-- 3. UPDATE - shop owners can update products for their own shop
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

-- 4. DELETE - shop owners can remove products from their own shop
--    (the app soft-deletes via is_available=false, which uses UPDATE,
--     but a real DELETE policy is kept for completeness/admin tooling)
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

-- 5. Admins retain full access
CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
TO authenticated
USING      (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Reload PostgREST schema cache so the new policies take effect
NOTIFY pgrst, 'reload schema';
