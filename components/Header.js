"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";

export default function Header() {
  const { cart } = useCart();
  const count = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Kabiru Collection" width={40} height={40} />
          <span className="font-bold text-lg tracking-wide">Kabiru Collection</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-dim hover:text-cream">Shop</Link>
          <Link href="/cart" className="bg-surface border border-border rounded-lg px-3 py-2 font-semibold">
            Cart {count > 0 && <span className="ml-1 bg-red text-white rounded-full px-2 text-xs">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
