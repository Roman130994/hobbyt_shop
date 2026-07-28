-- Запустіть один раз у Supabase → SQL Editor.
-- Дозволяє увійденому адміну видаляти замовлення.
drop policy if exists "Admins can delete orders" on public.orders;

create policy "Admins can delete orders"
on public.orders
for delete
to authenticated
using (true);
