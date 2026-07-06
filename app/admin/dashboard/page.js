"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const empty = { name: "", description: "", price: "", discount: "", sizes: "", stock: "", images: [], category: "" };

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }
  useEffect(() => { load(); }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, price: p.price, discount: p.discount,
      sizes: (p.sizes || []).join(", "), stock: p.stock,
      images: p.images && p.images.length ? p.images : (p.image_url ? [p.image_url] : []),
      category: p.category,
    });
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      } else {
        setMessage(data.error || "Upload failed");
      }
    }
    setUploading(false);
    e.target.value = ""; // let them pick the same file again if needed
  }

  function removeImage(idx) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function makeMain(idx) {
    setForm((f) => {
      const imgs = [...f.images];
      const [chosen] = imgs.splice(idx, 1);
      return { ...f, images: [chosen, ...imgs] };
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
      images: form.images,
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

        <div className="col-span-2">
          <label className="text-xs text-dim font-semibold block mb-2">Product photos (you can pick more than one)</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles}
            className="text-sm text-dim file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold file:text-bg file:font-bold file:cursor-pointer" />
          {uploading && <div className="text-dim text-sm mt-2">Uploading…</div>}
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {form.images.map((url, idx) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                  {idx === 0 && <span className="absolute -top-2 -left-2 bg-gold text-bg text-[10px] font-bold px-1.5 py-0.5 rounded">MAIN</span>}
                  <div className="flex gap-1 mt-1">
                    {idx !== 0 && (
                      <button type="button" onClick={() => makeMain(idx)} className="text-[10px] text-gold underline">main</button>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="text-[10px] text-red underline">remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            <th className="text-left py-2">Photo</th><th className="text-left py-2">Name</th><th className="text-left py-2">Price</th>
            <th className="text-left py-2">Discount</th><th className="text-left py-2">Stock</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const thumb = (p.images && p.images[0]) || p.image_url;
            return (
              <tr key={p.id} className="border-b border-border">
                <td className="py-2">
                  {thumb ? <img src={thumb} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-surface2 rounded" />}
                </td>
                <td className="py-2">{p.name}</td>
                <td className="py-2 font-mono">₦{Number(p.price).toLocaleString()}</td>
                <td className="py-2">{p.discount > 0 ? p.discount + "%" : "—"}</td>
                <td className="py-2">{p.stock}</td>
                <td className="py-2 text-right space-x-3">
                  <button onClick={() => startEdit(p)} className="text-gold font-semibold">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-red font-semibold">Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
