import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthed(req) {
  const cookie = req.cookies.get("kabiru_admin");
  return cookie && cookie.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const { data: orders } = await supabaseAdmin.from("orders").select("*");
  const { data: products } = await supabaseAdmin.from("products").select("*");

  const paidOrders = (orders || []).filter((o) => o.status === "paid");
  const pendingOrders = (orders || []).filter((o) => o.status !== "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);

  const salesMap = {};
  paidOrders.forEach((o) => {
    (o.items || []).forEach((it) => {
      salesMap[it.name] = (salesMap[it.name] || 0) + it.qty;
    });
  });
  const bestSellers = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lowStock = (products || []).filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  return NextResponse.json({
    totalRevenue,
    totalOrders: (orders || []).length,
    paidCount: paidOrders.length,
    pendingCount: pendingOrders.length,
    totalProducts: (products || []).length,
    bestSellers,
    lowStock,
    orders: orders || [],
  });
}
