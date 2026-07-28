-- Запустіть один раз у Supabase → SQL Editor.
-- Дозволяє покупцям створювати замовлення, але не читати їх.
alter table public.orders enable row level security;

grant insert on table public.orders to anon, authenticated;
grant usage, select on sequence public.orders_id_seq to anon, authenticated;

drop policy if exists "Customers can create orders" on public.orders;
create policy "Customers can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);
