import { supabase } from "@/lib/supabaseClient";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function ShopPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red">Could not load products: {error.message}</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 text-dim">
        <div className="text-xl text-cream font-bold mb-2">No products yet</div>
        Go to <code>/admin</code> to add your first item.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
