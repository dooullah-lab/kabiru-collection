"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";

export default function Header() {
  const { cart } = useCart();
  const router = useRouter();
  const [term, setTerm] = useState("");
  const count = cart.reduce((s, c) => s + c.qty, 0);

  function submitSearch(e) {
    e.preventDefault();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.svg" alt="Kabiru Collection" width={38} height={38} />
          <span className="font-bold text-lg tracking-wide hidden sm:inline">Kabiru Collection</span>
        </Link>

        <form onSubmit={submitSearch} className="flex-1 min-w-[180px] flex">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for anything…"
            className="w-full bg-surface2 border border-border rounded-l-lg px-3 py-2 text-sm"
          />
          <button className="bg-gold text-bg font-bold px-4 rounded-r-lg text-sm">Search</button>
        </form>

        <Link href="/cart" className="bg-surface border border-border rounded-lg px-3 py-2 font-semibold text-sm shrink-0">
          🛒 Cart {count > 0 && <span className="ml-1 bg-red text-white rounded-full px-2 text-xs">{count}</span>}
        </Link>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-3 flex gap-5 text-sm text-dim">
        <Link href="/" className="hover:text-cream">Shop</Link>
        <Link href="/categories" className="hover:text-cream">Categories</Link>
        <Link href="/support" className="hover:text-cream">Support</Link>
        <Link href="/contact" className="hover:text-cream">Contact</Link>
      </div>
    </header>
  );
}
