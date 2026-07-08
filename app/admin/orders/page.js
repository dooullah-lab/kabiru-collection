"use client";
import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

const statusLabels = {
  processing: "Processing",
  in_transit: "In Transit",
  delivered: "Delivered",
  received: "Received by customer",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("all");

  function load() {
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }
  useEffect(() => { load(); }, []);

  async function updateDelivery(id, delivery_status) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_status }),
    });
    load();
  }

  if (orders === null) return <div className="text-dim">Loading orders…</div>;

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <AdminNav active="Orders" />
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="flex gap-2 mb-5">
        {[["all", "All"], ["pending", "Pending payment"], ["paid", "Paid"]].map(([k, label]) => (
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
                  {o.status === "paid" ? "Paid" : "Payment pending"}
                </span>
              </div>
              <div className="text-dim text-sm mt-1">
                {new Date(o.created_at).toLocaleString()}
              </div>

              <div className="mt-2 bg-surface2 rounded-lg p-3 text-sm space-y-1">
                <div><span className="text-dim">Customer:</span> {o.customer_name || "—"}</div>
                <div><span className="text-dim">Email:</span> {o.customer_email || "—"}</div>
                <div><span className="text-dim">Phone:</span> {o.customer_phone || "—"}</div>
                <div><span className="text-dim">Address:</span> {o.shipping_address || "—"}</div>
              </div>

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

              {o.status === "paid" && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <span className="text-dim text-sm">Delivery status:</span>
                  <select
                    value={o.delivery_status || "processing"}
                    disabled={o.delivery_status === "received"}
                    onChange={(e) => updateDelivery(o.id, e.target.value)}
                    className="bg-surface2 border border-border rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  {o.delivery_status === "received" && (
                    <span className="text-green text-sm font-semibold">✓ Customer confirmed receipt</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
