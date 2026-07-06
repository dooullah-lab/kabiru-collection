// This is the PUBLIC connection to your database.
// It can only READ products (see supabase/schema.sql for the security rules).
// Safe to use in the browser.
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
