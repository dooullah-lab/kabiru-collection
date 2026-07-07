"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { supabaseBrowser } from "@/lib/supabaseBrowserClient";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function CartPage() {
  const { cart, changeQty } = useCart();
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [user, setUser] = useState(undefined);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      if (data.user?.user_metadata?.full_name) setName(data.user.user_metadata.full_name);
    });
  }, []);

  const total = cart.reduce((sum, c) => {
    const price = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
    return sum + price * c.qty;
  }, 0);

  async function checkout() {
    if (!user) {
      router.push("/account?redirect=/cart");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, email: user.email, name }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setErrorMsg(data.error || "Could not start checkout.");
      }
    } catch (e) {
      setErrorMsg("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (cart.length === 0) {
    return <div className="text-center py-24 text-dim">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {cart.map((c) => (
          <div key={c.id + c.size} className="flex items-center gap-3 border-b border-border pb-3">
            <div
              className="w-16 h-16 rounded-lg bg-surface2 bg-cover bg-center shrink-0"
              style={c.image_url ? { backgroundImage: `url(${c.image_url})` } : {}}
            />
            <div className="flex-1">
              <div className="font-semibold">{c.name}{c.size ? ` (${c.size})` : ""}</div>
              <div className="text-dim text-sm font-mono">{naira(c.price)} × {c.qty}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => changeQty(c.id, c.size, -1)} className="w-7 h-7 border border-border rounded">−</button>
              <span>{c.qty}</span>
              <button onClick={() => changeQty(c.id, c.size, 1)} className="w-7 h-7 border border-border rounded">+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold text-lg mt-6 font-mono">
        <span>Total</span><span>{naira(total)}</span>
      </div>

      <div className="mt-6 space-y-3">
        {user === null && (
          <div className="text-sm bg-surface2 border border-border rounded-lg px-3 py-2 text-dim">
            You'll need to sign in or create an account to check out.
          </div>
        )}
        {user && (
          <input
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        {errorMsg && <div className="text-red text-sm">{errorMsg}</div>}
        <button
          onClick={checkout}
          disabled={loading || user === undefined}
          className="w-full bg-green text-white font-bold py-3 rounded-xl"
        >
          {loading ? "Starting checkout…" : user ? "Pay with Paystack" : "Sign in to check out"}
        </button>
      </div>
    </div>
  );
}
