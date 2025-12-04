-- Add paid_at column to orders table for tracking payment timestamps
ALTER TABLE public.orders 
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;