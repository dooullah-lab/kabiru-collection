"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/CartContext";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    supabase.from("products").select("*").eq("id", params.id).single()
      .then(({ data }) => {
        setProduct(data);
        if (data?.sizes?.length) setSize(data.sizes[0]);
      });
  }, [params.id]);

  if (!product) return <div className="text-dim">Loading…</div>;

  const hasDiscount = Number(product.discount) > 0;
  const discounted = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div
        className="h-80 bg-surface2 rounded-2xl bg-cover bg-center"
        style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : {}}
      />
      <div>
        <div className="text-xs uppercase text-dim font-semibold">{product.category}</div>
        <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
        <p className="text-dim mt-3">{product.description}</p>
        <div className="flex items-baseline gap-3 mt-4 font-mono">
          <span className="text-gold text-2xl font-bold">{naira(discounted)}</span>
          {hasDiscount && <span className="text-dim line-through">{naira(product.price)}</span>}
        </div>

        {product.sizes?.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-dim mb-2">Size</div>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    size === s ? "bg-gold text-bg border-gold font-semibold" : "border-border text-dim"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          disabled={product.stock <= 0}
          onClick={() => addToCart(product, size)}
          className="mt-6 bg-gold disabled:bg-surface2 disabled:text-dim text-bg font-bold px-6 py-3 rounded-xl"
        >
          {product.stock <= 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
