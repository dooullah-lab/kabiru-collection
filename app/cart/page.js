"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function CartPage() {
  const { cart, changeQty, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const total = cart.reduce((sum, c) => {
    const price = c.discount > 0 ? Math.round(c.price * (1 - c.discount / 100)) : c.price;
    return sum + price * c.qty;
  }, 0);

  async function checkout() {
    if (!email) {
      setErrorMsg("Please enter your email so we can send your receipt.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, email, name }),
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
          <div key={c.id + c.size} className="flex justify-between items-center border-b border-border pb-3">
            <div>
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
        <input
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full bg-surface2 border border-border rounded-lg px-3 py-2"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errorMsg && <div className="text-red text-sm">{errorMsg}</div>}
        <button
          onClick={checkout}
          disabled={loading}
          className="w-full bg-green text-white font-bold py-3 rounded-xl"
        >
          {loading ? "Starting checkout…" : "Pay with Paystack"}
        </button>
      </div>
    </div>
  );
}
