
-- Reset analytics, click, and tracking data while preserving core data
-- Run this in Supabase SQL Editor

-- Helper function to safely truncate a table if it exists
CREATE OR REPLACE FUNCTION truncate_if_exists(_table_name TEXT)
RETURNS VOID AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = _table_name
  ) THEN
    EXECUTE 'TRUNCATE TABLE public.' || quote_ident(_table_name) || ' RESTART IDENTITY CASCADE';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 1. Reset website visits (analytics)
SELECT truncate_if_exists('website_visits');

-- 2. Reset concierge click tracking (if exists)
SELECT truncate_if_exists('concierge_clicks');

-- 3. Reset track visits (shop visits)
SELECT truncate_if_exists('track_visits');

-- 4. Reset stroke my shop (shop boosts)
SELECT truncate_if_exists('shop_strokes');

-- 5. Reset order notifications dispatch table
SELECT truncate_if_exists('order_whatsapp_dispatches');

-- Cleanup helper function
DROP FUNCTION IF EXISTS truncate_if_exists(_table_name TEXT);

-- Verify reset completed
SELECT 'Analytics and click data reset successfully!' AS status;
