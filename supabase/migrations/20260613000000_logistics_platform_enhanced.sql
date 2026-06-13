-- Logistics System Enhancement Migration
-- Phase 1-3: Full Multi-Carrier Support with Terminal Africa

---------------------------------------------------------------
-- 1. Extend shops table with delivery_mode and package defaults
---------------------------------------------------------------
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS delivery_mode TEXT NOT NULL DEFAULT 'self' CHECK (delivery_mode IN ('self', 'platform')),
ADD COLUMN IF NOT EXISTS default_package_weight_kg NUMERIC(10,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS default_package_dims JSONB DEFAULT '{"length": 20, "width": 15, "height": 10}'::jsonb;

COMMENT ON COLUMN public.shops.delivery_mode IS 'self = vendor handles delivery; platform = SteerSolo handles via Terminal Africa';
COMMENT ON COLUMN public.shops.default_package_weight_kg IS 'Default weight in kg for rate quotes when product weight is not specified';
COMMENT ON COLUMN public.shops.default_package_dims IS 'Default dimensions {length, width, height} in cm for rate quotes';

---------------------------------------------------------------
-- 2. Extend delivery_orders with Terminal Africa fields
---------------------------------------------------------------
ALTER TABLE public.delivery_orders
ADD COLUMN IF NOT EXISTS rate_id TEXT,
ADD COLUMN IF NOT EXISTS carrier_name TEXT,
ADD COLUMN IF NOT EXISTS carrier_logo TEXT,
ADD COLUMN IF NOT EXISTS label_url TEXT,
ADD COLUMN IF NOT EXISTS is_cod BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.delivery_orders.rate_id IS 'Terminal Africa rate ID used for this booking';
COMMENT ON COLUMN public.delivery_orders.carrier_name IS 'Carrier used (e.g., GIG Logistics, DHL)';
COMMENT ON COLUMN public.delivery_orders.carrier_logo IS 'URL to carrier logo';
COMMENT ON COLUMN public.delivery_orders.label_url IS 'Shipping label PDF URL from carrier';
COMMENT ON COLUMN public.delivery_orders.is_cod IS 'Cash on Delivery flag';
COMMENT ON COLUMN public.delivery_orders.metadata IS 'Additional provider-specific data';

---------------------------------------------------------------
-- 3. Add platform_settings for logistics feature toggles
---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: only admins can view and modify
CREATE POLICY "Admins can manage platform settings"
  ON public.platform_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default logistics settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('logistics_platform_enabled', '{"enabled": false, "allow_cod": true}', 'Enable/disable SteerSolo logistics platform'),
  ('logistics_default_carriers', '{"terminal": true, "sendbox": true}', 'Default enabled carriers'),
  ('logistics_convenience_fee_percent', '{"percent": 0}', 'Platform convenience fee % (0 = cost passthrough)')
ON CONFLICT (key) DO NOTHING;

---------------------------------------------------------------
-- 4. Add carrier_status table for per-carrier kill switches
---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carrier_status (
  carrier_code TEXT PRIMARY KEY,
  carrier_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carrier_status ENABLE ROW LEVEL SECURITY;

-- Policy: public read, admin write
CREATE POLICY "Anyone can view carrier status"
  ON public.carrier_status FOR SELECT USING (true);

CREATE POLICY "Admins can manage carrier status"
  ON public.carrier_status FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default carriers
INSERT INTO public.carrier_status (carrier_code, carrier_name, is_enabled, config) VALUES
  ('terminal_africa', 'Terminal Africa', true, '{"name": "Terminal Africa", "logo": "https://terminal.africa/logo.png"}'),
  ('sendbox', 'Sendbox', true, '{"name": "Sendbox", "logo": "https://sendbox.co/logo.png"}'),
  ('gig_logistics', 'GIG Logistics', true, '{"name": "GIG Logistics"}'),
  ('dhl', 'DHL', false, '{"name": "DHL"}'),
  ('kwik', 'Kwik', false, '{"name": "Kwik"}')
ON CONFLICT (carrier_code) DO NOTHING;

---------------------------------------------------------------
-- 5. Extend delivery_tracking_events with notification fields
---------------------------------------------------------------
ALTER TABLE public.delivery_tracking_events
ADD COLUMN IF NOT EXISTS notify_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_customer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.delivery_tracking_events.notify_vendor IS 'Whether vendor has been notified of this event';
COMMENT ON COLUMN public.delivery_tracking_events.notify_customer IS 'Whether customer has been notified of this event';

---------------------------------------------------------------
-- 6. Create function to get live rates from Terminal Africa
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_terminal_rates(
  p_pickup_address JSONB,
  p_delivery_address JSONB,
  p_weight_kg NUMERIC DEFAULT 1,
  p_dimensions JSONB DEFAULT NULL
)
RETURNS TABLE (
  carrier_name TEXT,
  carrier_logo TEXT,
  price NUMERIC,
  currency TEXT,
  estimated_days INTEGER,
  rate_id TEXT,
  service_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal_key TEXT;
  v_base_url TEXT := 'https://api.terminal.africa/v1';
  v_quote_response JSONB;
  v_pickup_addr JSONB;
  v_delivery_addr JSONB;
BEGIN
  -- Get Terminal API key from secrets
  SELECT value::text INTO v_terminal_key
  FROM vault.secrets
  WHERE name = 'TERMINAL_API_KEY';

  IF v_terminal_key IS NULL THEN
    RAISE NOTICE 'Terminal API key not configured';
    RETURN;
  END IF;

  -- Format pickup address
  v_pickup_addr := jsonb_build_object(
    'address_line_1', p_pickup_address->>'address',
    'city', p_pickup_address->>'city',
    'state', p_pickup_address->>'state',
    'country', COALESCE(p_pickup_address->>'country', 'NG'),
    'phone', p_pickup_address->>'phone',
    'name', p_pickup_address->>'name'
  );

  -- Format delivery address
  v_delivery_addr := jsonb_build_object(
    'address_line_1', p_delivery_address->>'address',
    'city', p_delivery_address->>'city',
    'state', p_delivery_address->>'state',
    'country', COALESCE(p_delivery_address->>'country', 'NG'),
    'phone', p_delivery_address->>'phone',
    'name', p_delivery_address->>'name'
  );

  -- Call Terminal Africa quote API
  v_quote_response := NULL;
  
  BEGIN
    SELECT content::jsonb INTO v_quote_response
    FROM net.http_post(
      url := v_base_url || '/rates/quote',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_terminal_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'origin', v_pickup_addr,
        'destination', v_delivery_addr,
        'weight', p_weight_kg,
        'dimensions', p_dimensions
      )
    ) AS resp;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Terminal quote failed: %', SQLERRM;
    RETURN;
  END;

  -- Parse and return rates
  IF v_quote_response IS NOT NULL AND (v_quote_response->'data') IS NOT NULL THEN
    FOR result IN
      SELECT
        r->>'name' AS carrier_name,
        r->>'logo' AS carrier_logo,
        (r->>'price')::NUMERIC AS price,
        'NGN' AS currency,
        COALESCE((r->>'estimated_days')::INTEGER, 3) AS estimated_days,
        r->>'rate_id' AS rate_id,
        COALESCE(r->>'service_type', 'standard') AS service_type
      FROM jsonb_array_elements(v_quote_response->'data') AS r
    LOOP
      RETURN NEXT;
    END LOOP;
  END IF;

  RETURN;
END;
$$;

---------------------------------------------------------------
-- 7. Create function to book delivery via Terminal Africa
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_terminal_delivery(
  p_delivery_order_id UUID,
  p_rate_id TEXT,
  p_is_cod BOOLEAN DEFAULT false
)
RETURNS TABLE (
  success BOOLEAN,
  shipment_id TEXT,
  tracking_code TEXT,
  label_url TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal_key TEXT;
  v_base_url TEXT := 'https://api.terminal.africa/v1';
  v_order RECORD;
  v_booking_response JSONB;
  v_shipment_data JSONB;
BEGIN
  -- Get Terminal API key
  SELECT value::text INTO v_terminal_key
  FROM vault.secrets
  WHERE name = 'TERMINAL_API_KEY';

  IF v_terminal_key IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Terminal API key not configured'::TEXT;
    RETURN;
  END IF;

  -- Get delivery order with related data
  SELECT do.*, o.total_amount, o.customer_name, o.customer_phone, o.customer_email
  INTO v_order
  FROM delivery_orders do
  JOIN orders o ON o.id = do.order_id
  WHERE do.id = p_delivery_order_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::TEXT, 'Delivery order not found'::TEXT;
    RETURN;
  END IF;

  -- Prepare shipment payload
  v_shipment_data := jsonb_build_object(
    'rate_id', p_rate_id,
    'origin', jsonb_build_object(
      'name', v_order.pickup_address->>'name',
      'phone', v_order.pickup_address->>'phone',
      'address_line_1', v_order.pickup_address->>'address',
      'city', v_order.pickup_address->>'city',
      'state', v_order.pickup_address->>'state',
      'country', COALESCE(v_order.pickup_address->>'country', 'NG')
    ),
    'destination', jsonb_build_object(
      'name', v_order.delivery_address->>'name',
      'phone', v_order.delivery_address->>'phone',
      'address_line_1', v_order.delivery_address->>'address',
      'city', v_order.delivery_address->>'city',
      'state', v_order.delivery_address->>'state',
      'country', COALESCE(v_order.delivery_address->>'country', 'NG')
    ),
    'metadata', jsonb_build_object(
      'order_id', v_order.order_id::TEXT,
      'delivery_order_id', p_delivery_order_id::TEXT
    ),
    'is_cod', p_is_cod,
    'cod_amount', CASE WHEN p_is_cod THEN v_order.total_amount ELSE NULL END
  );

  -- Call Terminal Africa booking API
  BEGIN
    SELECT content::jsonb INTO v_booking_response
    FROM net.http_post(
      url := v_base_url || '/shipments',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_terminal_key,
        'Content-Type', 'application/json'
      ),
      body := v_shipment_data
    ) AS resp;

    IF v_booking_response->>'success' = 'true' OR v_booking_response->'data' IS NOT NULL THEN
      -- Update delivery order with Terminal shipment data
      UPDATE delivery_orders SET
        provider_shipment_id = v_booking_response->'data'->>'id',
        provider_tracking_code = v_booking_response->'data'->>'tracking_number',
        label_url = v_booking_response->'data'->>'label_url',
        metadata = jsonb_build_object(
          'terminal_response', v_booking_response->'data',
          'booked_at', now()::TEXT
        )
      WHERE id = p_delivery_order_id;

      RETURN QUERY SELECT
        true,
        (v_booking_response->'data'->>'id')::TEXT,
        (v_booking_response->'data'->>'tracking_number')::TEXT,
        (v_booking_response->'data'->>'label_url')::TEXT,
        NULL::TEXT;
    ELSE
      RETURN QUERY SELECT
        false,
        NULL::TEXT,
        NULL::TEXT,
        NULL::TEXT,
        COALESCE(v_booking_response->>'message', 'Booking failed')::TEXT;
      RETURN;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::TEXT, SQLERRM::TEXT;
    RETURN;
  END;

END;
$$;

---------------------------------------------------------------
-- 8. Create function to cancel Terminal delivery
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_terminal_delivery(
  p_delivery_order_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal_key TEXT;
  v_base_url TEXT := 'https://api.terminal.africa/v1';
  v_order RECORD;
  v_cancel_response JSONB;
BEGIN
  -- Get Terminal API key
  SELECT value::text INTO v_terminal_key
  FROM vault.secrets
  WHERE name = 'TERMINAL_API_KEY';

  IF v_terminal_key IS NULL THEN
    RETURN QUERY SELECT false, 'Terminal API key not configured'::TEXT;
    RETURN;
  END IF;

  -- Get delivery order
  SELECT * INTO v_order
  FROM delivery_orders
  WHERE id = p_delivery_order_id
  AND provider = 'terminal';

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Terminal delivery order not found'::TEXT;
    RETURN;
  END IF;

  -- Check if cancellation is allowed (within 1 hour if not picked up)
  IF v_order.status NOT IN ('pending', 'confirmed') THEN
    RETURN QUERY SELECT false, 'Cannot cancel shipment that is already in transit or delivered'::TEXT;
    RETURN;
  END IF;

  -- Call Terminal Africa cancel API
  BEGIN
    SELECT content::jsonb INTO v_cancel_response
    FROM net.http_post(
      url := v_base_url || '/shipments/' || v_order.provider_shipment_id || '/cancel',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_terminal_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('reason', 'Customer/vendor cancellation')
    ) AS resp;

    IF v_cancel_response->>'success' = 'true' OR v_cancel_response->'data'->>'status' = 'cancelled' THEN
      -- Update delivery order
      UPDATE delivery_orders SET
        status = 'cancelled',
        cancelled_at = now(),
        metadata = jsonb_build_object(
          'cancelled_at', now()::TEXT,
          'cancellation_reason', 'Customer/vendor cancellation',
          'terminal_response', v_cancel_response
        )
      WHERE id = p_delivery_order_id;

      -- Create tracking event
      INSERT INTO delivery_tracking_events (delivery_order_id, status, description, notify_vendor, notify_customer)
      VALUES (p_delivery_order_id, 'cancelled', 'Shipment cancelled by vendor', true, true);

      RETURN QUERY SELECT true, NULL::TEXT;
    ELSE
      RETURN QUERY SELECT false, COALESCE(v_cancel_response->>'message', 'Cancellation failed')::TEXT;
      RETURN;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, SQLERRM::TEXT;
    RETURN;
  END;

END;
$$;

---------------------------------------------------------------
-- 9. Create function to get Terminal tracking
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_terminal_tracking(
  p_provider_shipment_id TEXT
)
RETURNS TABLE (
  status TEXT,
  tracking_number TEXT,
  events JSONB,
  last_update TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_terminal_key TEXT;
  v_base_url TEXT := 'https://api.terminal.africa/v1';
  v_tracking_response JSONB;
BEGIN
  -- Get Terminal API key
  SELECT value::text INTO v_terminal_key
  FROM vault.secrets
  WHERE name = 'TERMINAL_API_KEY';

  IF v_terminal_key IS NULL THEN
    RAISE NOTICE 'Terminal API key not configured';
    RETURN;
  END IF;

  -- Call Terminal Africa tracking API
  SELECT content::jsonb INTO v_tracking_response
  FROM net.http_get(
    url := v_base_url || '/shipments/' || p_provider_shipment_id || '/tracking',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_terminal_key
    )
  ) AS resp;

  IF v_tracking_response IS NOT NULL THEN
    RETURN QUERY SELECT
      v_tracking_response->'data'->>'status',
      v_tracking_response->'data'->>'tracking_number',
      v_tracking_response->'data'->'events',
      NOW();
  END IF;

  RETURN;
END;
$$;

---------------------------------------------------------------
-- 10. Create trigger to auto-book delivery on payment
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_book_delivery_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shop RECORD;
  v_delivery_order RECORD;
  v_rate_id TEXT;
  v_carrier_name TEXT;
  v_is_cod BOOLEAN;
BEGIN
  -- Only trigger on orders transitioning to 'paid' status
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
  
    -- Check if shop uses platform logistics
    SELECT * INTO v_shop
    FROM shops
    WHERE id = NEW.shop_id
    AND delivery_mode = 'platform';

    IF NOT FOUND THEN
      RAISE NOTICE 'Shop % does not use platform logistics', NEW.shop_id;
      RETURN NEW;
    END IF;

    -- Get pending delivery order
    SELECT * INTO v_delivery_order
    FROM delivery_orders
    WHERE order_id = NEW.id
    AND status = 'pending'
    AND provider = 'terminal';

    IF NOT FOUND THEN
      RAISE NOTICE 'No pending terminal delivery order for order %', NEW.id;
      RETURN NEW;
    END IF;

    -- Get the rate_id from metadata if available
    v_rate_id := v_delivery_order.metadata->>'rate_id';
    v_carrier_name := v_delivery_order.metadata->>'carrier_name';
    v_is_cod := COALESCE(v_delivery_order.is_cod, false);

    -- If we have a rate_id, book the delivery
    IF v_rate_id IS NOT NULL THEN
      UPDATE delivery_orders SET
        status = 'confirmed',
        rate_id = v_rate_id,
        carrier_name = v_carrier_name,
        metadata = jsonb_build_object(
          'auto_booked', true,
          'booked_at', now()::TEXT,
          'rate_id', v_rate_id,
          'carrier_name', v_carrier_name
        )
      WHERE id = v_delivery_order.id;

      -- Note: Actual Terminal API booking happens via the book_terminal_delivery function
      -- This trigger updates the local state; the webhook will update with actual tracking
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_book_delivery_on_payment ON public.orders;
CREATE TRIGGER auto_book_delivery_on_payment
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
EXECUTE FUNCTION public.auto_book_delivery_on_payment();

---------------------------------------------------------------
-- 11. Create trigger to notify on tracking events
---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_on_tracking_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_shop RECORD;
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_vendor_email TEXT;
  v_shop_name TEXT;
BEGIN
  -- Only create notification events for certain statuses
  IF NEW.status IN ('picked_up', 'out_for_delivery', 'delivered', 'failed') THEN
  
    -- Get order and shop details
    SELECT o.*, s.shop_name, s.owner_id
    INTO v_order
    FROM delivery_orders do
    JOIN orders o ON o.id = do.order_id
    JOIN shops s ON s.id = do.shop_id
    WHERE do.id = NEW.delivery_order_id;

    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    -- Get customer email
    v_customer_email := v_order.customer_email;
    v_customer_name := v_order.customer_name;
    v_shop_name := v_shop.shop_name;

    -- Get vendor email
    SELECT email INTO v_vendor_email
    FROM profiles
    WHERE id = v_shop.owner_id;

    -- Queue customer notification (handled by email queue)
    UPDATE delivery_tracking_events SET
      notify_customer = true
    WHERE id = NEW.id;

    -- Queue vendor notification for key events
    IF NEW.status IN ('picked_up', 'delivered', 'failed') THEN
      UPDATE delivery_tracking_events SET
        notify_vendor = true
      WHERE id = NEW.id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_tracking_update ON public.delivery_tracking_events;
CREATE TRIGGER notify_on_tracking_update
AFTER INSERT ON public.delivery_tracking_events
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_tracking_update();

---------------------------------------------------------------
-- 12. Create index on delivery_orders for stuck shipments query
---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_delivery_orders_created_at 
ON public.delivery_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_status_created 
ON public.delivery_orders(status, created_at DESC);

---------------------------------------------------------------
-- 13. Update shop_addresses to require is_pickup_default
---------------------------------------------------------------
ALTER TABLE public.shop_addresses
ALTER COLUMN is_default SET DEFAULT false;

-- Create function to ensure only one default address per shop
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE shop_addresses
    SET is_default = false
    WHERE shop_id = NEW.shop_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_single_default_address ON public.shop_addresses;
CREATE TRIGGER ensure_single_default_address
AFTER INSERT OR UPDATE OF is_default ON public.shop_addresses
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_address();

---------------------------------------------------------------
-- 14. Grant execute on new functions to authenticated users
---------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.get_terminal_rates TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_terminal_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_terminal_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_terminal_tracking TO authenticated;
