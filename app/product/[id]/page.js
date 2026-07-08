"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/CartContext";
import ImageLightbox from "@/components/ImageLightbox";
import ProductCard from "@/components/ProductCard";

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [related, setRelated] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    setActiveImg(0);
    supabase.from("products").select("*").eq("id", params.id).single()
      .then(({ data }) => {
        setProduct(data);
        if (data?.sizes?.length) setSize(data.sizes[0]);
        if (data?.category) {
          supabase.from("products").select("*")
            .eq("category", data.category).neq("id", data.id).limit(4)
            .then(({ data: rel }) => setRelated(rel || []));
        }
      });
  }, [params.id]);

  if (!product) return <div className="text-dim">Loading…</div>;

  const images = (product.images && product.images.length ? product.images : (product.image_url ? [product.image_url] : []));
  const hasDiscount = Number(product.discount) > 0;
  const discounted = hasDiscount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  function prevImg(e) { e.stopPropagation(); setActiveImg((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function nextImg(e) { e.stopPropagation(); setActiveImg((i) => (i === images.length - 1 ? 0 : i + 1)); }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div
            onClick={() => images[activeImg] && setLightboxOpen(true)}
            className="relative h-80 bg-surface2 rounded-2xl bg-cover bg-center cursor-zoom-in group"
            style={images[activeImg] ? { backgroundImage: `url(${images[activeImg]})` } : {}}
          >
            {images[activeImg] && (
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg group-hover:bg-black/80">
                🔍 Click to zoom
              </span>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg"
                >
                  ‹
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeImg ? "bg-white" : "bg-white/40"}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg bg-cover bg-center border-2 ${activeImg === i ? "border-gold" : "border-border"}`}
                  style={{ backgroundImage: `url(${img})` }}
                />
              ))}
            </div>
          )}
        </div>
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
                      size === s ? "bg-gold text-ink border-gold font-semibold" : "border-border text-dim"
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
            onClick={() => addToCart({ ...product, image_url: images[0] }, size)}
            className="mt-6 bg-gold disabled:bg-surface2 disabled:text-dim text-ink font-bold px-6 py-3 rounded-xl"
          >
            {product.stock <= 0 ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-bold mb-4">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox src={images[activeImg]} alt={product.name} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}
