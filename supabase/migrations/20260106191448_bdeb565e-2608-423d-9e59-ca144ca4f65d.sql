-- Add remaining policies (skip ones that already exist)

-- Allow shop owners to view orders for their shop
DROP POLICY IF EXISTS "Shop owners can view shop orders" ON public.orders;
CREATE POLICY "Shop owners can view shop orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Allow shop owners to update orders for their shop
DROP POLICY IF EXISTS "Shop owners can update shop orders" ON public.orders;
CREATE POLICY "Shop owners can update shop orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Allow authenticated users to create order items
DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  order_exists(order_id)
);

-- Allow customers to view their order items
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_id = auth.uid()
  )
);

-- Allow shop owners to view order items for their orders
DROP POLICY IF EXISTS "Shop owners can view order items" ON public.order_items;
CREATE POLICY "Shop owners can view order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.shops s ON o.shop_id = s.id
    WHERE o.id = order_items.order_id 
    AND s.owner_id = auth.uid()
  )
);