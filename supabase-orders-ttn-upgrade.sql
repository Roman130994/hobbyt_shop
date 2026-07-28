-- Запустіть один раз, якщо таблиця orders уже створена.
alter table public.orders add column if not exists delivery_data jsonb;
alter table public.orders add column if not exists ttn_number text;
alter table public.orders add column if not exists ttn_ref text;
alter table public.orders add column if not exists ttn_created_at timestamptz;

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (true)
with check (true);
