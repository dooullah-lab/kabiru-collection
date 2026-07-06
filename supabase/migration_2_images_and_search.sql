-- Run this in Supabase SQL Editor (New query -> paste -> Run)
-- Safe to run even if you already added products.

-- Add a proper multi-image column
alter table products add column if not exists images text[] default '{}';

-- Move any existing single image_url into the new images list
update products
set images = array[image_url]
where (images is null or images = '{}') and image_url is not null and image_url <> '';
