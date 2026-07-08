"use client";
import { useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    fetch(`/api/admin/reports?${params.toString()}`).then((r) => r.json()).then(setData);
  }

  useEffect(() => { load(); }, []);

  // Every individual item sold, with who bought it -- this is the
  // "what was sold, and to whom" breakdown.
  const salesRows = useMemo(() => {
    if (!data) return [];
    const rows = [];
    data.orders
      .filter((o) => o.status === "paid")
      .forEach((o) => {
        (o.items || []).forEach((it) => {
          rows.push({
            date: new Date(o.created_at).toLocaleDateString(),
            product: it.name,
            size: it.size || "",
            qty: it.qty,
            unitPrice: it.price,
            lineTotal: it.price * it.qty,
            customer: o.customer_name || "—",
            email: o.customer_email || "—",
            phone: o.customer_phone || "—",
          });
        });
      });
    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data]);

  function downloadCSV() {
    const rows = [["Date", "Product", "Size", "Qty", "Unit Price", "Line Total", "Customer", "Email", "Phone"]];
    salesRows.forEach((r) => rows.push([r.date, r.product, r.size, r.qty, r.unitPrice, r.lineTotal, r.customer, r.email, r.phone]));
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kabiru-collection-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadExcel() {
    const XLSX = await import("xlsx");
    const sheetData = salesRows.map((r) => ({
      Date: r.date, Product: r.product, Size: r.size, Qty: r.qty,
      "Unit Price (₦)": r.unitPrice, "Line Total (₦)": r.lineTotal,
      Customer: r.customer, Email: r.email, Phone: r.phone,
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `kabiru-collection-sales-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function downloadPDF() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Kabiru Collection — Sales Report", 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated ${new Date().toLocaleString()}`, 14, 21);
    autoTable(doc, {
      startY: 26,
      head: [["Date", "Product", "Size", "Qty", "Unit ₦", "Total ₦", "Customer", "Phone"]],
      body: salesRows.map((r) => [r.date, r.product, r.size, r.qty, r.unitPrice, r.lineTotal, r.customer, r.phone]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [18, 18, 26] },
    });
    doc.save(`kabiru-collection-sales-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  if (!data) return <div className="text-dim">Loading report…</div>;

  return (
    <div>
      <AdminNav active="Reports" />
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="bg-surface2 border border-border font-semibold px-4 py-2 rounded-lg text-sm">CSV</button>
          <button onClick={downloadExcel} className="bg-surface2 border border-border font-semibold px-4 py-2 rounded-lg text-sm">Excel</button>
          <button onClick={downloadPDF} className="bg-gold text-ink font-bold px-4 py-2 rounded-lg text-sm">PDF</button>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6 flex-wrap bg-surface border border-border rounded-xl p-4">
        <label className="text-sm">
          <div className="text-dim text-xs mb-1">From</div>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-surface2 border border-border rounded-lg px-3 py-2" />
        </label>
        <label className="text-sm">
          <div className="text-dim text-xs mb-1">To</div>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-surface2 border border-border rounded-lg px-3 py-2" />
        </label>
        <button onClick={load} className="bg-gold text-ink font-bold px-4 py-2 rounded-lg text-sm">Apply</button>
        {(from || to) && (
          <button onClick={() => { setFrom(""); setTo(""); setTimeout(load, 0); }} className="text-dim border border-border px-4 py-2 rounded-lg text-sm">
            Clear
          </button>
        )}
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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

      <div className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="font-bold mb-3">What sold, and to whom</h2>
        {salesRows.length === 0 ? (
          <div className="text-dim text-sm">No sales in this period yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dim text-xs uppercase border-b border-border">
                  <th className="text-left py-2 pr-3">Date</th>
                  <th className="text-left py-2 pr-3">Product</th>
                  <th className="text-left py-2 pr-3">Qty</th>
                  <th className="text-left py-2 pr-3">Total</th>
                  <th className="text-left py-2 pr-3">Customer</th>
                  <th className="text-left py-2 pr-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {salesRows.map((r, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2 pr-3">{r.date}</td>
                    <td className="py-2 pr-3">{r.product}{r.size ? ` (${r.size})` : ""}</td>
                    <td className="py-2 pr-3">{r.qty}</td>
                    <td className="py-2 pr-3 font-mono">{naira(r.lineTotal)}</td>
                    <td className="py-2 pr-3">{r.customer}</td>
                    <td className="py-2 pr-3">{r.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
