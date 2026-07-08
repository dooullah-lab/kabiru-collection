import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthed(req) {
  const cookie = req.cookies.get("kabiru_admin");
  return cookie && cookie.value === process.env.ADMIN_PASSWORD;
}

export async function GET(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { data: allOrders } = await supabaseAdmin.from("orders").select("*");
  const { data: products } = await supabaseAdmin.from("products").select("*");

  const orders = (allOrders || []).filter((o) => {
    const created = new Date(o.created_at).getTime();
    if (from && created < new Date(from).getTime()) return false;
    if (to && created > new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
    return true;
  });

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
