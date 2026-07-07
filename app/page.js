import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function ShopPage({ searchParams }) {
  const q = searchParams?.q || "";
  const category = searchParams?.category || "";

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category", category);
  const { data: products, error } = await query;

  const { data: allProducts } = await supabase.from("products").select("category");
  const categories = Array.from(new Set((allProducts || []).map((p) => p.category).filter(Boolean)));

  const { data: deals } = !q && !category
    ? await supabase.from("products").select("*").gt("discount", 0).order("discount", { ascending: false }).limit(8)
    : { data: [] };

  if (error) {
    return <div className="text-red">Could not load products: {error.message}</div>;
  }

  return (
    <div>
      {!q && !category && (
        <>
          <div className="bg-surface border border-border rounded-2xl px-8 py-10 mb-6 text-center">
            <h1 className="text-3xl font-bold">Kabiru Collection</h1>
            <p className="text-dim mt-2">Quality goods, honest prices.</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl px-6 py-4 mb-8 flex flex-wrap justify-around gap-3 text-sm text-dim">
            <span>🔒 Secure payments via Paystack</span>
            <span>✅ Every item checked before listing</span>
            <span>🚚 Delivery guarantee</span>
          </div>

          {deals && deals.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold mb-4">⚡ Hot Deals</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {deals.map((p) => (
                  <div key={p.id} className="w-44 shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <a href="/" className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${!category ? "bg-green text-white border-green" : "border-border text-dim"}`}>
            All
          </a>
          {categories.map((c) => (
            <a
              key={c}
              href={`/?category=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${category === c ? "bg-green text-white border-green" : "border-border text-dim"}`}
            >
              {c}
            </a>
          ))}
        </div>
      )}

      {q && <div className="text-dim mb-4">Showing results for "<span className="text-cream">{q}</span>"</div>}

      {(!products || products.length === 0) ? (
        <div className="text-center py-24 text-dim">
          <div className="text-xl text-cream font-bold mb-2">
            {q || category ? "No matching products" : "No products yet"}
          </div>
          {!q && !category && <>Go to <code>/admin</code> to add your first item.</>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
