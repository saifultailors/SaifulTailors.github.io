-- Only for checking the public read access. Your products table already exists.
grant usage on schema public to anon;
grant select on table public.products to anon;
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products for select to anon using (true);
