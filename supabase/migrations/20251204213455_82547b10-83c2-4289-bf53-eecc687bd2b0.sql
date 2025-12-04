-- Create function to reduce product stock when order items are created
CREATE OR REPLACE FUNCTION public.reduce_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Reduce stock quantity for the ordered product
  UPDATE public.products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id
  AND stock_quantity >= NEW.quantity;
  
  -- Check if update was successful (sufficient stock)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after order_items insert
DROP TRIGGER IF EXISTS trigger_reduce_stock_on_order ON public.order_items;
CREATE TRIGGER trigger_reduce_stock_on_order
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.reduce_product_stock();