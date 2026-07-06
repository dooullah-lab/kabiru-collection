// This is the SECRET, full-power connection to your database.
// It can create, edit, and delete products.
// NEVER import this file into anything that runs in the browser —
// only use it inside app/api/... routes (server-side).
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
