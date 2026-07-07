"use client";
import { createBrowserClient } from "@supabase/ssr";

// Use this inside components that need to sign up, sign in, sign out,
// or check "who is logged in" from the browser. It keeps the session
// in cookies so the server can recognize the same logged-in customer.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
