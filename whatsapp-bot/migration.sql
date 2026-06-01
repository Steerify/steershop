-- Run this in your Supabase SQL Editor to create the post tracking table

create table if not exists public.whatsapp_post_log (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  hook_type   text not null,
  posted_at   timestamptz not null default now()
);

-- Index for fast "was this product posted in the last 24h?" lookups
create index if not exists whatsapp_post_log_product_id_idx
  on public.whatsapp_post_log (product_id, posted_at desc);

-- Optional: auto-delete logs older than 7 days to keep the table small
-- (requires pg_cron to be enabled in your Supabase project)
-- select cron.schedule('cleanup-wa-log', '0 3 * * *',
--   $$delete from public.whatsapp_post_log where posted_at < now() - interval '7 days'$$);
