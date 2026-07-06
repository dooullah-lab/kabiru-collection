"use client";
import Link from "next/link";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function ProductCard({ product }) {
  const hasDiscount = Number(product.discount) > 0;
  const discounted = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;
  const outOfStock = Number(product.stock) <= 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="relative bg-surface border border-border rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-transform"
    >
      {hasDiscount && <div className="price-tag">-{product.discount}%</div>}
      <div
        className="h-40 bg-surface2 bg-cover bg-center flex items-center justify-center text-dim text-xs"
        style={product.image_url ? { backgroundImage: `url(${product.image_url})` } : {}}
      >
        {!product.image_url && "No image"}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-dim font-semibold">
          {product.category || "General"}
        </div>
        <div className="font-bold leading-tight">{product.name}</div>
        <div className="flex items-baseline gap-2 mt-1 font-mono">
          <span className="text-gold font-semibold">{naira(discounted)}</span>
          {hasDiscount && <span className="text-dim text-xs line-through">{naira(product.price)}</span>}
        </div>
        <div className={`text-xs font-semibold ${outOfStock ? "text-red" : "text-green"}`}>
          {outOfStock ? "Out of stock" : `${product.stock} in stock`}
        </div>
      </div>
    </Link>
  );
}
