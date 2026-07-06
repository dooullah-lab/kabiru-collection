import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export const revalidate = 0;

export default async function CategoriesPage() {
  const { data: products } = await supabase.from("products").select("category, images, image_url");

  const map = {};
  (products || []).forEach((p) => {
    const cat = p.category || "General";
    if (!map[cat]) map[cat] = { count: 0, thumb: (p.images && p.images[0]) || p.image_url };
    map[cat].count += 1;
  });
  const categories = Object.entries(map);

  if (categories.length === 0) {
    return (
      <div className="text-center py-24 text-dim">
        No categories yet — add some products in <code>/admin</code> and they'll show up here.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shop by Category</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map(([name, info]) => (
          <Link
            key={name}
            href={`/?category=${encodeURIComponent(name)}`}
            className="bg-surface border border-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform"
          >
            <div
              className="h-32 bg-surface2 bg-cover bg-center"
              style={info.thumb ? { backgroundImage: `url(${info.thumb})` } : {}}
            />
            <div className="p-4">
              <div className="font-bold">{name}</div>
              <div className="text-dim text-sm">{info.count} item{info.count !== 1 ? "s" : ""}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
