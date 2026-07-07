-- Run this in Supabase SQL Editor (New query -> paste -> Run)
alter table orders add column if not exists shipping_address text;
