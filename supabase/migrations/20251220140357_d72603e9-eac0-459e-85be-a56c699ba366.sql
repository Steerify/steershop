-- Create bookings table for service appointments
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookings
CREATE POLICY "Shop owners can view their shop bookings"
ON public.bookings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shops
  WHERE shops.id = bookings.shop_id
  AND shops.owner_id = auth.uid()
));

CREATE POLICY "Shop owners can update their shop bookings"
ON public.bookings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.shops
  WHERE shops.id = bookings.shop_id
  AND shops.owner_id = auth.uid()
));

CREATE POLICY "Customers can view their own bookings"
ON public.bookings
FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND customer_id IS NULL) OR
  (auth.uid() IS NOT NULL AND customer_id = auth.uid())
);

-- Create updated_at trigger
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;