import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, { params }) {
  const server = supabaseServer();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single();
  if (!order || order.customer_id !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  if (order.delivery_status !== "delivered") {
    return NextResponse.json({ error: "This order hasn't been marked delivered yet." }, { status: 400 });
  }

  await supabaseAdmin.from("orders").update({ delivery_status: "received" }).eq("id", params.id);
  return NextResponse.json({ ok: true });
}
