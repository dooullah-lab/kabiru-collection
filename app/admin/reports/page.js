"use client";
import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function AdminReports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/reports").then((r) => r.json()).then(setData);
  }, []);

  function downloadCSV() {
    if (!data) return;
    const rows = [["Order ID", "Date", "Customer Email", "Status", "Total (NGN)", "Items"]];
    data.orders.forEach((o) => {
      const itemsSummary = (o.items || []).map((it) => `${it.name} x${it.qty}`).join("; ");
      rows.push([o.id, new Date(o.created_at).toLocaleString(), o.customer_email || "", o.status, o.total, itemsSummary]);
    });
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kabiru-collection-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <div className="text-dim">Loading report…</div>;

  return (
    <div>
      <AdminNav active="Reports" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button onClick={downloadCSV} className="bg-gold text-bg font-bold px-4 py-2 rounded-lg text-sm">
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold font-mono">{naira(data.totalRevenue)}</div>
          <div className="text-dim text-xs mt-1">Total revenue (paid)</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold">{data.totalOrders}</div>
          <div className="text-dim text-xs mt-1">Total orders</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-green">{data.paidCount}</div>
          <div className="text-dim text-xs mt-1">Paid orders</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-gold">{data.pendingCount}</div>
          <div className="text-dim text-xs mt-1">Pending orders</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-xl font-bold">{data.totalProducts}</div>
          <div className="text-dim text-xs mt-1">Total products</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Best sellers</h2>
          {data.bestSellers.length === 0 ? (
            <div className="text-dim text-sm">No paid sales yet.</div>
          ) : (
            <div className="space-y-2 text-sm">
              {data.bestSellers.map(([name, qty]) => (
                <div key={name} className="flex justify-between">
                  <span>{name}</span><span className="font-mono text-dim">{qty} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-bold mb-3">Low stock (5 or fewer)</h2>
          {data.lowStock.length === 0 ? (
            <div className="text-dim text-sm">Nothing running low right now.</div>
          ) : (
            <div className="space-y-2 text-sm">
              {data.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className={p.stock === 0 ? "text-red font-semibold" : "text-gold font-semibold"}>{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
