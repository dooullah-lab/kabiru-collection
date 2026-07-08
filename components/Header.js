"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [term, setTerm] = useState("");
  const [user, setUser] = useState(undefined);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

  return (
    <header className="sticky top-0 z-20 bg-navy border-b border-black/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Kabiru Collection" width={38} height={38} />
          <span className="font-bold text-lg tracking-wide hidden sm:inline text-white">Kabiru Collection</span>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 min-w-[180px] flex">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for anything…"
            className="w-full bg-white/10 border border-white/15 text-white placeholder-white/50 rounded-l-lg px-3 py-2 text-sm"
          />
          <button className="bg-gold text-ink font-bold px-4 rounded-r-lg text-sm">Search</button>
        </form>

        <Link href="/account" className="text-sm text-white/80 hover:text-white shrink-0 font-medium">
          {user ? "My Account" : "Sign in / Register"}
        </Link>

        <Link href="/cart" className="bg-white/10 border border-white/15 text-white rounded-lg px-3 py-2 font-semibold text-sm shrink-0">
          🛒 Cart {count > 0 && <span className="ml-1 bg-red text-white rounded-full px-2 text-xs">{count}</span>}
        </Link>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-3 flex gap-5 text-sm text-white/70">
        <Link href="/" className="hover:text-white">Shop</Link>
        <Link href="/categories" className="hover:text-white">Categories</Link>
        <Link href="/support" className="hover:text-white">Support</Link>
        <Link href="/contact" className="hover:text-white">Contact</Link>
      </div>
    </header>
  );
}
