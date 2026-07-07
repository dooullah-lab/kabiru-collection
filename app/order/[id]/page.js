"use client";
import { useEffect, useState } from "react";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function OrderPage({ params }) {
  const [order, setOrder] = useState(undefined);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/order/${params.id}`).then(async (res) => {
      const data = await res.json();
      if (!res.ok) setErrorMsg(data.error || "Could not load this order.");
      else setOrder(data.order);
    });
  }, [params.id]);

  if (errorMsg) return <div className="text-center py-24 text-red">{errorMsg}</div>;
  if (order === undefined) return <div className="text-dim">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="text-3xl mb-2">{order.status === "paid" ? "✅" : "⏳"}</div>
        <h1 className="text-2xl font-bold">
          {order.status === "paid" ? "Thank you for your order!" : "Order received"}
        </h1>
        <p className="text-dim mt-1">
          {order.status === "paid"
            ? "Your payment was successful. We're getting your order ready."
            : "We're waiting for your payment to be confirmed."}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-dim">Order #{order.id.slice(0, 8)}</span>
          <span className={order.status === "paid" ? "text-green font-semibold" : "text-gold font-semibold"}>
            {order.status}
          </span>
        </div>
        <div className="space-y-2 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name}{item.size ? ` (${item.size})` : ""} × {item.qty}</span>
              <span className="font-mono">{naira(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold border-t border-border pt-3 font-mono">
          <span>Total</span><span>{naira(order.total)}</span>
        </div>
      </div>

      <a href="/" className="block text-center mt-6 text-gold font-semibold">← Continue shopping</a>
    </div>
  );
}
