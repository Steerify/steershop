-- ============================================================
-- Fix: Restore product write permissions for shop owners
-- Root cause: "Shop owners can manage products" FOR ALL policy
-- was broken or dropped by a subsequent migration, leaving vendors
-- unable to INSERT into the products table.
--
-- This migration cleanly splits the write policy into explicit
-- INSERT / UPDATE / DELETE policies scoped to authenticated users,
-- which is more reliable than a combined FOR ALL on TO public.
-- ============================================================

-- 1. Drop all existing write policies on products (clean slate)
DROP POLICY IF EXISTS "Shop owners can manage products"        ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products"         ON public.products;
DROP POLICY IF EXISTS "Vendors can insert own products"        ON public.products;
DROP POLICY IF EXISTS "Vendors can update own products"        ON public.products;
DROP POLICY IF EXISTS "Vendors can delete own products"        ON public.products;

-- 2. INSERT – shop owners can create products for their own shop
CREATE POLICY "Vendors can insert own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id  = products.shop_id
      AND shops.owner_id = auth.uid()
  )
);

-- 3. UPDATE – shop owners can update products for their own shop
CREATE POLICY "Vendors can update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id  = products.shop_id
      AND shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id  = products.shop_id
      AND shops.owner_id = auth.uid()
  )
);

-- 4. DELETE – shop owners can remove products from their own shop
CREATE POLICY "Vendors can delete own products"
ON public.products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id  = products.shop_id
      AND shops.owner_id = auth.uid()
  )
);

-- 5. Admins retain full access
CREATE POLICY "Admins can manage all products"
ON public.products
FOR ALL
TO authenticated
USING     (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
