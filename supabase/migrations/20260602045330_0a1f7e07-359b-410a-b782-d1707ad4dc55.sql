-- P0-A: Paystack plan codes on subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS paystack_plan_monthly text,
  ADD COLUMN IF NOT EXISTS paystack_plan_yearly text;

-- P0-B: Atomic stock decrement
CREATE OR REPLACE FUNCTION public.decrement_stock_if_available(
  _product_id uuid,
  _quantity integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_rows integer;
BEGIN
  IF _quantity IS NULL OR _quantity <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.products
     SET stock_quantity = stock_quantity - _quantity,
         updated_at = now()
   WHERE id = _product_id
     AND is_available = true
     AND stock_quantity >= _quantity;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock_if_available(uuid, integer) TO anon, authenticated, service_role;

-- P1: Server-authoritative shop balance
CREATE OR REPLACE FUNCTION public.get_shop_balance(_shop_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_revenue numeric;
  v_paid_out numeric;
BEGIN
  SELECT owner_id INTO v_owner FROM public.shops WHERE id = _shop_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Shop not found';
  END IF;
  IF auth.uid() IS NULL OR (auth.uid() <> v_owner AND NOT public.has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COALESCE(SUM(net_amount), 0) INTO v_revenue
    FROM public.revenue_transactions
   WHERE shop_id = _shop_id AND status = 'released';

  SELECT COALESCE(SUM(amount), 0) INTO v_paid_out
    FROM public.shop_payouts
   WHERE shop_id = _shop_id AND status IN ('pending','processing','completed');

  RETURN v_revenue - v_paid_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_shop_balance(uuid) TO authenticated, service_role;

-- P1: Idempotent payout request
CREATE OR REPLACE FUNCTION public.request_payout(
  _shop_id uuid,
  _amount numeric,
  _bank_name text,
  _account_number text,
  _account_name text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_balance numeric;
  v_payout_id uuid;
  v_recent_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT owner_id INTO v_owner FROM public.shops WHERE id = _shop_id;
  IF v_owner IS NULL OR v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  -- Duplicate-request guard: same shop + same amount within 60s
  SELECT COUNT(*) INTO v_recent_count
    FROM public.shop_payouts
   WHERE shop_id = _shop_id
     AND amount = _amount
     AND requested_at > now() - interval '60 seconds';

  IF v_recent_count > 0 THEN
    RAISE EXCEPTION 'Duplicate payout request — please wait before retrying';
  END IF;

  v_balance := public.get_shop_balance(_shop_id);
  IF _amount > v_balance THEN
    RAISE EXCEPTION 'Requested amount exceeds available balance';
  END IF;

  INSERT INTO public.shop_payouts (shop_id, amount, bank_name, account_number, account_name, status, requested_at)
  VALUES (_shop_id, _amount, _bank_name, _account_number, _account_name, 'pending', now())
  RETURNING id INTO v_payout_id;

  RETURN v_payout_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_payout(uuid, numeric, text, text, text) TO authenticated, service_role;

-- P1: Auto-maintain orders.updated_at
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();