-- Create a security definer function to check if an order exists
CREATE OR REPLACE FUNCTION public.order_exists(order_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_id_param
  );
$$;

-- Create a security definer function to check if a product is available with enough stock
CREATE OR REPLACE FUNCTION public.product_available(product_id_param uuid, quantity_param integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM products
    WHERE id = product_id_param
    AND is_available = true
    AND stock_quantity >= quantity_param
  );
$$;

-- Update the order_items INSERT policy to use security definer functions
DROP POLICY IF EXISTS "Allow anonymous and authenticated order items creation" ON order_items;

CREATE POLICY "Allow anonymous and authenticated order items creation"
ON order_items FOR INSERT
WITH CHECK (
  public.order_exists(order_id) 
  AND public.product_available(product_id, quantity)
);