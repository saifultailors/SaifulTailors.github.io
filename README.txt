SAIFUL TAILORS ADMIN PANEL

1) Supabase -> Authentication -> Users -> Add user.
   Create your private admin email/password.
2) Supabase -> Storage -> New bucket -> name: products -> Public ON.
3) Supabase SQL Editor -> run admin-setup.sql once.
4) Deploy admin.html, admin.css, admin.js together on Netlify.
5) Open /admin.html and log in.
6) Add image + name + price + description -> Publish.
7) The customer website reads from public.products.

SECURITY:
- Do not use a service_role key in this website.
- Only give the admin email/password to yourself.
- The browser uses the Supabase anon/public key.
