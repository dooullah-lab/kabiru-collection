-- Run this in Supabase SQL Editor (New query -> paste -> Run)
alter table orders add column if not exists customer_phone text;
alter table orders add column if not exists delivery_status text default 'processing';
-- delivery_status values: processing -> in_transit -> delivered -> received
