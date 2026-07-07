"use client";
import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);

  if (orders === null) return <div className="text-dim">Loading orders…</div>;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <AdminNav active="Orders" />
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="flex gap-2 mb-5">
        {[["all", "All"], ["pending", "Pending"], ["paid", "Paid"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${filter === k ? "bg-green text-white border-green" : "border-border text-dim"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-dim text-sm">No orders here yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div key={o.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Order #{o.id.slice(0, 8)}</span>
                <span className={o.status === "paid" ? "text-green font-semibold" : "text-gold font-semibold"}>
                  {o.status}
                </span>
              </div>
              <div className="text-dim text-sm mt-1">
                {o.customer_name || "—"} · {o.customer_email} · {new Date(o.created_at).toLocaleString()}
              </div>
              {o.shipping_address && <div className="text-dim text-xs mt-1">📍 {o.shipping_address}</div>}
              <div className="mt-2 text-sm space-y-1">
                {o.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.name}{it.size ? ` (${it.size})` : ""} × {it.qty}</span>
                    <span className="font-mono">{naira(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border font-mono text-sm">
                <span>Total</span><span>{naira(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
