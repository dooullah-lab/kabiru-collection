-- Run this once inside Supabase: SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric not null,
  discount numeric default 0,
  sizes text[] default '{}',
  stock int default 0,
  image_url text default '',
  category text default 'General',
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total numeric not null,
  customer_name text,
  customer_email text,
  status text default 'pending',
  paystack_ref text,
  created_at timestamptz default now()
);

-- Security: turn on Row Level Security so nobody can write to these
-- tables directly from the browser -- only your server (using the
-- secret service role key) can create/edit/delete rows.
alter table products enable row level security;
alter table orders enable row level security;

-- Anyone (including visitors browsing your store) is allowed to
-- READ products. Nobody is allowed to write -- that's on purpose.
create policy "Public can read products"
  on products for select
  using (true);
