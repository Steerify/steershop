-- Add digital products support columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS digital_file_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS digital_delivery_text TEXT;

COMMENT ON COLUMN public.products.is_digital IS 'Whether this is a digital product (eBook, course, software, etc.)';
COMMENT ON COLUMN public.products.digital_file_url IS 'Direct download link for the digital product file';
COMMENT ON COLUMN public.products.digital_delivery_text IS 'Delivery instructions, download keys, or video links sent upon successful payment';
