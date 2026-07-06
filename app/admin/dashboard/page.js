"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const empty = { name: "", description: "", price: "", discount: "", sizes: "", stock: "", image_url: "", category: "" };

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: p.price, discount: p.discount,
      sizes: (p.sizes || []).join(", "), stock: p.stock, image_url: p.image_url, category: p.category,
    });
  }

  async function submit(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      image_url: form.image_url,
      category: form.category || "General",
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      setMessage(editingId ? "Product updated" : "Product added");
      setForm(empty);
      setEditingId(null);
      load();
    } else {
      setMessage("Something went wrong");
    }
    setTimeout(() => setMessage(""), 2000);
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>

      <form onSubmit={submit} className="bg-surface border border-border rounded-2xl p-6 grid grid-cols-2 gap-3 mb-8">
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2 col-span-2" placeholder="Product name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2" placeholder="Category"
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2" placeholder="Price (₦)" type="number"
          value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2" placeholder="Discount %" type="number"
          value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2" placeholder="Sizes (S, M, L)"
          value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2" placeholder="Stock quantity" type="number"
          value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="bg-surface2 border border-border rounded-lg px-3 py-2 col-span-2" placeholder="Image URL"
          value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <textarea className="bg-surface2 border border-border rounded-lg px-3 py-2 col-span-2" placeholder="Description" rows={3}
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="col-span-2 flex gap-3 items-center">
          <button className="bg-gold text-bg font-bold px-5 py-2.5 rounded-lg">{editingId ? "Save changes" : "Add product"}</button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty); }} className="text-dim border border-border px-4 py-2.5 rounded-lg">
              Cancel
            </button>
          )}
          {message && <span className="text-green text-sm font-semibold">{message}</span>}
        </div>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-dim text-xs uppercase border-b border-border">
            <th className="text-left py-2">Name</th><th className="text-left py-2">Price</th>
            <th className="text-left py-2">Discount</th><th className="text-left py-2">Stock</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-2">{p.name}</td>
              <td className="py-2 font-mono">₦{Number(p.price).toLocaleString()}</td>
              <td className="py-2">{p.discount > 0 ? p.discount + "%" : "—"}</td>
              <td className="py-2">{p.stock}</td>
              <td className="py-2 text-right space-x-3">
                <button onClick={() => startEdit(p)} className="text-gold font-semibold">Edit</button>
                <button onClick={() => remove(p.id)} className="text-red font-semibold">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
