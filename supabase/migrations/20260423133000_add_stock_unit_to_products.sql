alter table public.products
add column if not exists stock_unit text not null default 'units';

update public.products
set stock_unit = 'units'
where stock_unit is null or btrim(stock_unit) = '';
