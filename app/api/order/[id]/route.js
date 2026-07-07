import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req, { params }) {
  const server = supabaseServer();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.customer_id !== user.id) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  return NextResponse.json({ order });
}
