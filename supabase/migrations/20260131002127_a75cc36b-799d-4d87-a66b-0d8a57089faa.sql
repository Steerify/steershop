-- Create delivery_orders table
CREATE TABLE IF NOT EXISTS public.delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'terminal', 'sendbox', 'manual'
  provider_shipment_id TEXT,
  provider_tracking_code TEXT,
  
  -- Addresses stored as JSONB
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  
  -- Parcel info
  weight_kg NUMERIC(10,2),
  dimensions JSONB, -- {length, width, height}
  
  -- Pricing
  delivery_fee NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', 
  -- pending, confirmed, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled
  
  -- Timestamps
  estimated_delivery_date TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create delivery_tracking_events table (audit log)
CREATE TABLE IF NOT EXISTS public.delivery_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  provider_event_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create shop_addresses table (saved pickup locations)
CREATE TABLE IF NOT EXISTS public.shop_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  
  label TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'NG',
  lat NUMERIC(10,8),
  lng NUMERIC(11,8),
  
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(shop_id, label)
);

-- Enable RLS
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_orders
CREATE POLICY "Shop owners can manage delivery orders"
  ON public.delivery_orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = delivery_orders.shop_id 
    AND shops.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = delivery_orders.shop_id 
    AND shops.owner_id = auth.uid()
  ));

CREATE POLICY "Customers can view their deliveries"
  ON public.delivery_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = delivery_orders.order_id 
    AND orders.customer_id = auth.uid()
  ));

-- RLS Policies for delivery_tracking_events
CREATE POLICY "Shop owners can manage tracking events"
  ON public.delivery_tracking_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.delivery_orders d
    JOIN public.shops s ON s.id = d.shop_id
    WHERE d.id = delivery_tracking_events.delivery_order_id
    AND s.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.delivery_orders d
    JOIN public.shops s ON s.id = d.shop_id
    WHERE d.id = delivery_tracking_events.delivery_order_id
    AND s.owner_id = auth.uid()
  ));

CREATE POLICY "Customers can view tracking events"
  ON public.delivery_tracking_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.delivery_orders d
    JOIN public.orders o ON o.id = d.order_id
    WHERE d.id = delivery_tracking_events.delivery_order_id
    AND o.customer_id = auth.uid()
  ));

-- RLS Policies for shop_addresses
CREATE POLICY "Shop owners can manage addresses"
  ON public.shop_addresses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_addresses.shop_id 
    AND shops.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.shops WHERE shops.id = shop_addresses.shop_id 
    AND shops.owner_id = auth.uid()
  ));

-- Create update trigger for updated_at
CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON public.delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shop_addresses_updated_at
  BEFORE UPDATE ON public.shop_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_delivery_orders_order_id ON public.delivery_orders(order_id);
CREATE INDEX idx_delivery_orders_shop_id ON public.delivery_orders(shop_id);
CREATE INDEX idx_delivery_orders_status ON public.delivery_orders(status);
CREATE INDEX idx_delivery_tracking_events_delivery_order_id ON public.delivery_tracking_events(delivery_order_id);
CREATE INDEX idx_shop_addresses_shop_id ON public.shop_addresses(shop_id);