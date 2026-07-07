import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyAndSyncOrder } from "@/lib/paystackVerify";

export async function GET() {
  const server = supabaseServer();
  const { data: { user } } = await server.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: rawOrders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Double-check any still-pending orders against Paystack directly,
  // so the list is accurate even if the webhook hasn't fired.
  const orders = await Promise.all((rawOrders || []).map((o) => verifyAndSyncOrder(o)));

  return NextResponse.json({ orders });
}
