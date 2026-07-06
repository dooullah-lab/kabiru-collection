import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Paystack calls this URL automatically after a customer pays.
// We check the signature to make sure the message really came from Paystack
// (not someone pretending to be Paystack).
export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const orderId = event.data.metadata?.order_id;
    if (orderId) {
      const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single();
      if (order && order.status !== "paid") {
        await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", orderId);
        // Reduce stock for each item bought
        for (const item of order.items) {
          const { data: product } = await supabaseAdmin.from("products").select("stock").eq("id", item.id).single();
          if (product) {
            await supabaseAdmin.from("products").update({ stock: Math.max(0, product.stock - item.qty) }).eq("id", item.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
