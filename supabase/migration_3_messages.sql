-- Run this in Supabase SQL Editor (New query -> paste -> Run)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);
alter table messages enable row level security;
-- No public read/write policies on purpose: only your server
-- (using the secret service role key) can insert or read these.
