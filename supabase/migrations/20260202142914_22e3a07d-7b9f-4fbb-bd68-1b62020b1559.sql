-- Add target_audience column to courses table for shop owner tutorials
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS target_audience text NOT NULL DEFAULT 'customer';

-- Add check constraint for valid values
ALTER TABLE public.courses 
ADD CONSTRAINT courses_target_audience_check 
CHECK (target_audience IN ('customer', 'shop_owner', 'all'));

-- Update existing courses to be for customers by default (already set via default)
COMMENT ON COLUMN public.courses.target_audience IS 'Specifies who the course is for: customer, shop_owner, or all';