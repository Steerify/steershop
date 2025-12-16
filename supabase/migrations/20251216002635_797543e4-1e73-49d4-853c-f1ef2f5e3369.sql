-- Add order timestamp columns for tracking order lifecycle
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_by TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add product type column to support services
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'product';
ALTER TABLE products ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS booking_required BOOLEAN DEFAULT false;

-- Add check constraint for product type
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products ADD CONSTRAINT products_type_check CHECK (type IN ('product', 'service'));