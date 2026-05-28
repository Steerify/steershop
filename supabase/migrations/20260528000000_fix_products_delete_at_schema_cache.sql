-- Corrective migration for the products.delete_at column.
--
-- The original migration (20260518000000) called cron.unschedule() against a
-- job that may not exist. In pg_cron that raises an exception, and because the
-- migration runs in a single transaction it rolled back the ALTER TABLE that
-- adds products.delete_at. The result was a missing column and the PostgREST
-- error: "Could not find the 'delete_at' column of 'products' in the schema cache".
--
-- This re-applies the column idempotently and reloads the API schema cache so
-- the fix lands on databases where the original migration was already recorded.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delete_at TIMESTAMPTZ DEFAULT NULL;

NOTIFY pgrst, 'reload schema';
