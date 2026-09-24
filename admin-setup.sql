-- Run this ONCE in Supabase SQL Editor.
-- Your public website already has SELECT access. These policies add
-- authenticated admin access and Storage access for the Admin Panel.

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.products to authenticated;

drop policy if exists "Authenticated can insert products" on public.products;
create policy "Authenticated can insert products"
on public.products for insert to authenticated
with check (true);

drop policy if exists "Authenticated can update products" on public.products;
create policy "Authenticated can update products"
on public.products for update to authenticated
using (true) with check (true);

drop policy if exists "Authenticated can delete products" on public.products;
create policy "Authenticated can delete products"
on public.products for delete to authenticated
using (true);

-- Storage bucket must be named products.
-- Create it in Storage first and make it Public.
-- Then these policies allow only logged-in users to upload/update/delete files.

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'products');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images"
on storage.objects for update to authenticated
using (bucket_id = 'products')
with check (bucket_id = 'products');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'products');
