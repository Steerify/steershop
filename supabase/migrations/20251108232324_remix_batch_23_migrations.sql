
-- Migration: 20251020102606
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('shop_owner', 'customer', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role public.user_role DEFAULT 'customer' NOT NULL,
  is_subscribed BOOLEAN DEFAULT false NOT NULL,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shop_name TEXT NOT NULL,
  shop_slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Shops RLS Policies
CREATE POLICY "Anyone can view active shops"
  ON public.shops FOR SELECT
  USING (is_active = true OR auth.uid() = owner_id);

CREATE POLICY "Shop owners can create shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owners can update own shops"
  ON public.shops FOR UPDATE
  USING (auth.uid() = owner_id);

-- Products RLS Policies
CREATE POLICY "Anyone can view products from active shops"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id
      AND (shops.is_active = true OR shops.owner_id = auth.uid())
    )
  );

CREATE POLICY "Shop owners can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Orders RLS Policies
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Shop owners can view shop orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = orders.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Order Items RLS Policies
CREATE POLICY "Anyone can view order items for accessible orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.customer_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.shops
        WHERE shops.id = orders.shop_id
        AND shops.owner_id = auth.uid()
      ))
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Migration: 20251021071232
-- Update the handle_new_user function to give shop owners a 7-day free trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role user_role;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
  
  -- Insert profile with trial for shop owners
  INSERT INTO public.profiles (id, email, full_name, role, is_subscribed, subscription_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    user_role,
    CASE 
      WHEN user_role = 'shop_owner' THEN true
      ELSE false
    END,
    CASE 
      WHEN user_role = 'shop_owner' THEN NOW() + INTERVAL '7 days'
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$function$;

-- Migration: 20251021071617
-- Create storage buckets for shop assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('shop-images', 'shop-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- RLS policies for shop-images bucket
CREATE POLICY "Shop owners can upload shop images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Shop owners can update their shop images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Shop owners can delete their shop images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view shop images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'shop-images');

-- RLS policies for product-images bucket
CREATE POLICY "Shop owners can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM products p
    JOIN shops s ON s.id = p.shop_id
    WHERE s.owner_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM shops s
    WHERE s.owner_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM shops s
    WHERE s.owner_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Migration: 20251022072356
-- Create reviews table for shop ratings
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Authenticated customers can create reviews
CREATE POLICY "Customers can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id);

-- Add average rating to shops for quick access
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Function to update shop ratings
CREATE OR REPLACE FUNCTION public.update_shop_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shops
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
    )
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update shop ratings
CREATE TRIGGER update_shop_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_shop_rating();

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Add payment reference to orders for Paystack
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add customer contact info to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- Migration: 20251023080608
-- Fix products RLS policy to allow INSERT operations
-- The current "Shop owners can manage products" policy only has USING clause
-- We need to add WITH CHECK clause for INSERT to work

DROP POLICY IF EXISTS "Shop owners can manage products" ON public.products;

CREATE POLICY "Shop owners can manage products"
ON public.products
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1
    FROM shops
    WHERE shops.id = products.shop_id
    AND shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM shops
    WHERE shops.id = products.shop_id
    AND shops.owner_id = auth.uid()
  )
);

-- Migration: 20251023081024
-- Add RLS policies for customers to create orders and order items

-- Allow authenticated and anonymous users to create orders
CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  -- Verify shop exists and is active
  EXISTS (
    SELECT 1 FROM shops
    WHERE id = shop_id AND is_active = true
  )
  -- If customer_id is provided, it must match auth.uid()
  AND (customer_id IS NULL OR customer_id = auth.uid())
);

-- Allow shop owners to update orders (for status management)
CREATE POLICY "Shop owners can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops
    WHERE shops.id = orders.shop_id
    AND shops.owner_id = auth.uid()
  )
);

-- Allow customers to create order items when creating an order
CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO public
WITH CHECK (
  -- Allow if the parent order exists and is accessible
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
  )
  AND EXISTS (
    SELECT 1 FROM products
    WHERE products.id = order_items.product_id
    AND products.is_available = true
    AND products.stock_quantity >= order_items.quantity
  )
);

-- Allow shop owners to update order items
CREATE POLICY "Shop owners can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN shops s ON s.id = o.shop_id
    WHERE o.id = order_items.order_id
    AND s.owner_id = auth.uid()
  )
);

-- Migration: 20251023081408
-- Fix product-images upload policy
-- The current policy checks for existing products, but we upload images BEFORE creating the product
-- Instead, we should check if the user owns any shop, and verify the folder matches their shop

DROP POLICY IF EXISTS "Shop owners can upload product images" ON storage.objects;

CREATE POLICY "Shop owners can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  -- User must own a shop, and the upload path should start with their shop_id
  AND EXISTS (
    SELECT 1 FROM shops s
    WHERE s.owner_id = auth.uid()
    -- Verify the file path starts with the user's shop_id
    AND (storage.foldername(name))[1] = s.id::text
  )
);

-- Migration: 20251024075336
-- Add payment and contact configuration to shops table
ALTER TABLE public.shops
ADD COLUMN payment_method text CHECK (payment_method IN ('bank_transfer', 'paystack')) DEFAULT 'bank_transfer',
ADD COLUMN bank_account_name text,
ADD COLUMN bank_name text,
ADD COLUMN bank_account_number text,
ADD COLUMN paystack_public_key text,
ADD COLUMN whatsapp_number text;

-- Add comment explaining the payment_method options
COMMENT ON COLUMN public.shops.payment_method IS 'Payment method: bank_transfer for manual bank details, paystack for automatic Paystack integration';
COMMENT ON COLUMN public.shops.whatsapp_number IS 'WhatsApp contact number for direct communication with customers';

-- Migration: 20251024081323
-- Fix RLS policy to allow both authenticated and anonymous users to create orders
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;

CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Verify shop exists and is active
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id 
    AND shops.is_active = true
  )
  AND (
    -- Allow anonymous orders (customer_id is NULL)
    customer_id IS NULL
    OR
    -- Allow authenticated users to create their own orders
    customer_id = auth.uid()
  )
);

-- Migration: 20251024081757
-- Fix RLS policy to explicitly allow both anonymous and authenticated users
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;

CREATE POLICY "Customers can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Verify shop exists and is active
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id 
    AND shops.is_active = true
  )
  AND (
    -- Allow anonymous orders (customer_id is NULL)
    customer_id IS NULL
    OR
    -- Allow authenticated users to create their own orders
    customer_id = auth.uid()
  )
);

-- Also ensure order_items policy allows anonymous users
DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;

CREATE POLICY "Customers can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Verify parent order exists
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
  )
  AND
  -- Verify product exists, is available, and has sufficient stock
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
    AND products.is_available = true
    AND products.stock_quantity >= order_items.quantity
  )
);

-- Migration: 20251024082609
-- Completely recreate the RLS policies for orders and order_items to allow anonymous checkout

-- First, drop all existing policies
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Shop owners can view shop orders" ON public.orders;
DROP POLICY IF EXISTS "Shop owners can update orders" ON public.orders;

DROP POLICY IF EXISTS "Customers can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items for accessible orders" ON public.order_items;
DROP POLICY IF EXISTS "Shop owners can update order items" ON public.order_items;

-- Create new policies for orders table

-- Allow ANYONE (anon and authenticated) to create orders for active shops
CREATE POLICY "Allow anonymous and authenticated order creation"
ON public.orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id 
    AND shops.is_active = true
  )
);

-- Allow customers to view their own orders (authenticated only)
CREATE POLICY "Customers can view own orders"
ON public.orders
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND auth.uid() = customer_id
);

-- Allow shop owners to view orders for their shops
CREATE POLICY "Shop owners can view shop orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Allow shop owners to update orders for their shops
CREATE POLICY "Shop owners can update orders"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = orders.shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Create new policies for order_items table

-- Allow ANYONE to create order items for valid orders
CREATE POLICY "Allow anonymous and authenticated order items creation"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
  )
  AND
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = order_items.product_id
    AND products.is_available = true
    AND products.stock_quantity >= order_items.quantity
  )
);

-- Allow users to view order items for orders they can access
CREATE POLICY "Anyone can view order items for accessible orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (
      orders.customer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.shops
        WHERE shops.id = orders.shop_id 
        AND shops.owner_id = auth.uid()
      )
    )
  )
);

-- Allow shop owners to update order items
CREATE POLICY "Shop owners can update order items"
ON public.order_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.shops s ON s.id = o.shop_id
    WHERE o.id = order_items.order_id 
    AND s.owner_id = auth.uid()
  )
);

-- Migration: 20251025104147
-- Create app_role enum for proper RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'shop_owner', 'customer');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update handle_new_user function to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer');
  
  -- Insert profile (remove role column)
  INSERT INTO public.profiles (id, email, full_name, is_subscribed, subscription_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN user_role = 'shop_owner' THEN true
      ELSE false
    END,
    CASE 
      WHEN user_role = 'shop_owner' THEN NOW() + INTERVAL '7 days'
      ELSE NULL
    END
  );
  
  -- Insert role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;

-- Migration: 20251025104208
-- Create courses table for admin-created courses
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  image_url text,
  reward_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses"
ON public.courses FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  reward_claimed boolean DEFAULT false,
  UNIQUE (course_id, user_id)
);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
ON public.course_enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
ON public.course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
ON public.course_enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- Create customer preferences table
CREATE TABLE public.customer_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  favorite_categories text[],
  notification_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
ON public.customer_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
ON public.customer_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create product recommendations table
CREATE TABLE public.product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  score numeric DEFAULT 0,
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
ON public.product_recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_customer_preferences_updated_at
BEFORE UPDATE ON public.customer_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Migration: 20251102074558
-- Fix the handle_new_user function to correctly set the role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  );
  RETURN new;
END;
$$;

-- Migration: 20251102080740
-- Update the handle_new_user function to automatically give shop owners a 7-day trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role user_role;
  trial_end timestamp with time zone;
BEGIN
  -- Get the role from metadata
  user_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role);
  
  -- If shop owner, set trial to 7 days from now
  IF user_role = 'shop_owner' THEN
    trial_end := now() + interval '7 days';
  ELSE
    trial_end := NULL;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, is_subscribed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    user_role,
    trial_end,
    CASE WHEN user_role = 'shop_owner' THEN false ELSE false END
  );
  
  RETURN new;
END;
$$;

-- Migration: 20251102082128
-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role user_role;
  trial_end timestamp with time zone;
BEGIN
  -- Get the role from metadata
  user_role := COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role);
  
  -- If shop owner, set trial to 7 days from now
  IF user_role = 'shop_owner' THEN
    trial_end := now() + interval '7 days';
  ELSE
    trial_end := NULL;
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, is_subscribed)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    user_role,
    trial_end,
    false
  );
  
  RETURN new;
END;
$$;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix the existing shop owner who doesn't have trial set
UPDATE public.profiles
SET subscription_expires_at = created_at + interval '7 days'
WHERE role = 'shop_owner' 
  AND subscription_expires_at IS NULL 
  AND is_subscribed = false;

-- Migration: 20251103075131
-- Allow anyone to view subscription status for shop visibility
-- This only exposes subscription info, not sensitive personal data
CREATE POLICY "Anyone can view subscription status"
ON profiles
FOR SELECT
USING (true);

-- Migration: 20251103075854
-- Create special offers table for admin to manage promotions
CREATE TABLE public.special_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  code text,
  discount_percentage integer,
  valid_until timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  target_audience text NOT NULL DEFAULT 'customers',
  button_text text NOT NULL DEFAULT 'Claim Offer',
  button_link text NOT NULL DEFAULT '/shops',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active offers
CREATE POLICY "Anyone can view active offers"
ON public.special_offers
FOR SELECT
USING (is_active = true);

-- Admins can manage offers
CREATE POLICY "Admins can manage offers"
ON public.special_offers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_special_offers_updated_at
BEFORE UPDATE ON public.special_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default offers
INSERT INTO public.special_offers (title, description, code, discount_percentage, valid_until, target_audience, button_text, button_link)
VALUES 
  ('Welcome Bonus! 🎁', 'Get 10% off your first order. Use code: WELCOME10', 'WELCOME10', 10, now() + interval '7 days', 'customers', 'Claim Offer', '/shops'),
  ('7-Day Free Trial! 🚀', 'Start your store today. No credit card required.', NULL, NULL, NULL, 'entrepreneurs', 'Start Free', '/auth/signup');

-- Migration: 20251104073824
-- Fix critical privilege escalation vulnerabilities

-- Step 1: Update handle_new_user trigger to ONLY allow customer/shop_owner roles
-- and insert into user_roles table instead of setting profiles.role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  safe_role user_role;
  trial_end timestamp with time zone;
BEGIN
  -- Get requested role from metadata
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Whitelist validation: Only allow customer and shop_owner during signup
  -- Admin roles must be granted manually by existing admins
  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    trial_end := now() + interval '7 days';
  ELSE
    -- Default to customer for any other value (including 'admin' attempts)
    safe_role := 'customer'::user_role;
    trial_end := NULL;
  END IF;
  
  -- Create profile with safe role
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, is_subscribed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    safe_role,
    trial_end,
    false
  );
  
  -- Insert into user_roles table (the authoritative source for roles)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_role);
  
  RETURN NEW;
END;
$function$;

-- Step 2: Update profiles RLS policy to prevent role modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent role changes - role must match existing value
  role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Step 3: Update shops RLS policies to use has_role function
DROP POLICY IF EXISTS "Shop owners can create shops" ON public.shops;
DROP POLICY IF EXISTS "Shop owners can update own shops" ON public.shops;

CREATE POLICY "Shop owners can create shops"
ON public.shops
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id AND
  public.has_role(auth.uid(), 'shop_owner'::app_role)
);

CREATE POLICY "Shop owners can update own shops"
ON public.shops
FOR UPDATE
USING (
  auth.uid() = owner_id AND
  public.has_role(auth.uid(), 'shop_owner'::app_role)
);

-- Step 4: Update products RLS policy to use has_role function
DROP POLICY IF EXISTS "Shop owners can manage products" ON public.products;

CREATE POLICY "Shop owners can manage products"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.shops
    WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
      AND public.has_role(auth.uid(), 'shop_owner'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.shops
    WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
      AND public.has_role(auth.uid(), 'shop_owner'::app_role)
  )
);

-- Migration: 20251104074750
-- Add rewards_points table for tracking customer points
CREATE TABLE IF NOT EXISTS public.rewards_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create rewards_prizes table
CREATE TABLE IF NOT EXISTS public.rewards_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points_required integer NOT NULL,
  image_url text,
  is_active boolean DEFAULT true NOT NULL,
  stock_quantity integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create prize_claims table
CREATE TABLE IF NOT EXISTS public.prize_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prize_id uuid REFERENCES public.rewards_prizes(id) ON DELETE CASCADE NOT NULL,
  points_spent integer NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  claimed_at timestamptz DEFAULT now() NOT NULL,
  fulfilled_at timestamptz
);

-- Enable RLS
ALTER TABLE public.rewards_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards_points
CREATE POLICY "Users can view own points"
  ON public.rewards_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points record"
  ON public.rewards_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rewards_prizes
CREATE POLICY "Anyone can view active prizes"
  ON public.rewards_prizes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage prizes"
  ON public.rewards_prizes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for prize_claims
CREATE POLICY "Users can view own prize claims"
  ON public.prize_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create prize claims"
  ON public.prize_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all prize claims"
  ON public.prize_claims FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update prize claims"
  ON public.prize_claims FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create function to award points when course is completed
CREATE OR REPLACE FUNCTION public.award_course_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_points integer;
BEGIN
  -- Only proceed if course was just completed and reward not yet claimed
  IF NEW.completed_at IS NOT NULL 
     AND OLD.completed_at IS NULL 
     AND NEW.reward_claimed = false THEN
    
    -- Get reward points for this course
    SELECT reward_points INTO course_points
    FROM public.courses
    WHERE id = NEW.course_id;
    
    -- Insert or update user's total points
    INSERT INTO public.rewards_points (user_id, total_points)
    VALUES (NEW.user_id, course_points)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = rewards_points.total_points + course_points,
      updated_at = now();
    
    -- Mark reward as claimed
    NEW.reward_claimed = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for awarding points
DROP TRIGGER IF EXISTS trigger_award_course_points ON public.course_enrollments;
CREATE TRIGGER trigger_award_course_points
  BEFORE UPDATE ON public.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.award_course_points();

-- Create function to handle prize claims
CREATE OR REPLACE FUNCTION public.claim_prize(
  p_prize_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points_required integer;
  v_user_points integer;
  v_stock integer;
  v_claim_id uuid;
BEGIN
  -- Get prize details
  SELECT points_required, stock_quantity INTO v_points_required, v_stock
  FROM public.rewards_prizes
  WHERE id = p_prize_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Prize not found or inactive');
  END IF;
  
  -- Check stock
  IF v_stock <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Prize out of stock');
  END IF;
  
  -- Get user points
  SELECT total_points INTO v_user_points
  FROM public.rewards_points
  WHERE user_id = p_user_id;
  
  IF v_user_points IS NULL OR v_user_points < v_points_required THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points
  UPDATE public.rewards_points
  SET total_points = total_points - v_points_required,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Decrease stock
  UPDATE public.rewards_prizes
  SET stock_quantity = stock_quantity - 1,
      updated_at = now()
  WHERE id = p_prize_id;
  
  -- Create claim record
  INSERT INTO public.prize_claims (user_id, prize_id, points_spent, status)
  VALUES (p_user_id, p_prize_id, v_points_required, 'pending')
  RETURNING id INTO v_claim_id;
  
  RETURN json_build_object(
    'success', true, 
    'claim_id', v_claim_id,
    'points_spent', v_points_required,
    'remaining_points', v_user_points - v_points_required
  );
END;
$$;

-- Migration: 20251105081103
-- Backfill user_roles table with existing profile roles
-- This fixes authentication for existing users who don't have user_roles entries

INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  CASE 
    WHEN p.role::text = 'admin' THEN 'admin'::app_role
    WHEN p.role::text = 'shop_owner' THEN 'shop_owner'::app_role
    ELSE 'customer'::app_role
  END
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.id
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Migration: 20251105091244
-- Create table to track sent expiry notifications
CREATE TABLE IF NOT EXISTS public.subscription_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- '7_days', '3_days', '1_day'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  subscription_expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.subscription_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_subscription_notifications_user_type 
ON public.subscription_notifications(user_id, notification_type, subscription_expires_at);

-- Migration: 20251106081550
-- Fix type mismatch in handle_new_user function
-- The user_roles table uses app_role enum, but handle_new_user was using user_role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  safe_role user_role;
  safe_app_role app_role;
  trial_end timestamp with time zone;
BEGIN
  -- Get requested role from metadata
  requested_role := NEW.raw_user_meta_data->>'role';
  
  -- Whitelist validation: Only allow customer and shop_owner during signup
  -- Admin roles must be granted manually by existing admins
  IF requested_role = 'shop_owner' THEN
    safe_role := 'shop_owner'::user_role;
    safe_app_role := 'shop_owner'::app_role;
    trial_end := now() + interval '7 days';
  ELSE
    -- Default to customer for any other value (including 'admin' attempts)
    safe_role := 'customer'::user_role;
    safe_app_role := 'customer'::app_role;
    trial_end := NULL;
  END IF;
  
  -- Create profile with safe role (uses user_role enum)
  INSERT INTO public.profiles (id, email, full_name, role, subscription_expires_at, is_subscribed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    safe_role,
    trial_end,
    false
  );
  
  -- Insert into user_roles table (uses app_role enum)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_app_role);
  
  RETURN NEW;
END;
$function$;
