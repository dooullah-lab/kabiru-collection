-- Run this in Supabase SQL Editor (New query -> paste -> Run)

-- Link each order to the customer account that placed it
alter table orders add column if not exists customer_id uuid references auth.users(id);

-- IMPORTANT: also turn off "Confirm email" so customers can sign up
-- and buy right away without waiting for a confirmation email:
-- Supabase dashboard -> Authentication -> Sign In / Providers -> Email
-- -> turn OFF "Confirm email". (You can turn this back on later once
-- you've connected a proper email sending service.)
