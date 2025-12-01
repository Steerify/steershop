-- 1. Enable RLS on all necessary tables (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- 2. Policy for shop owners to SELECT their orders (THIS IS WHAT'S MISSING)
CREATE POLICY "Shop owners can view their orders" 
ON orders FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- 3. Policy for shop owners to UPDATE their orders
CREATE POLICY "Shop owners can update their orders" 
ON orders FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM shops 
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- 4. Policy for INSERT (already exists, but ensure it's correct)
-- Drop existing if it exists
DROP POLICY IF EXISTS "Allow anonymous and authenticated order creation" ON orders;

-- Recreate INSERT policy
CREATE POLICY "Allow order creation" 
ON orders FOR INSERT 
WITH CHECK (public.shop_is_active(shop_id));

-- 5. Policy for order_items SELECT
CREATE POLICY "Shop owners can view order items" 
ON order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    JOIN shops ON orders.shop_id = shops.id
    WHERE orders.id = order_items.order_id 
    AND shops.owner_id = auth.uid()
  )
);

-- 6. Policy for products SELECT (needed for joins)
CREATE POLICY "Anyone can view products" 
ON products FOR SELECT 
USING (true);

-- 7. Keep the existing INSERT policy for order_items (for customers)
-- Drop existing if it exists
DROP POLICY IF EXISTS "Allow anonymous and authenticated order items creation" ON order_items;

-- Recreate with proper check
CREATE POLICY "Allow order items creation" 
ON order_items FOR INSERT 
WITH CHECK (
  public.order_exists(order_id) 
  AND public.product_available(product_id, quantity)
);