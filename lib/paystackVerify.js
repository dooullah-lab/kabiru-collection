import { supabaseAdmin } from "./supabaseAdmin";

// This is the real fix for orders getting stuck on "pending": instead of
// only relying on Paystack calling our webhook (which needs to be set up
// correctly in the Paystack dashboard, and can be missed while testing),
// we also actively ask Paystack "did this actually get paid?" whenever a
// customer views the order. Whichever happens first -- the webhook or
// this check -- marks the order paid.
export async function verifyAndSyncOrder(order) {
  if (order.status === "paid" || !order.paystack_ref) return order;

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${order.paystack_ref}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const data = await res.json();

    if (data.status && data.data.status === "success") {
      await supabaseAdmin.from("orders").update({ status: "paid" }).eq("id", order.id);
      for (const item of order.items) {
        const { data: product } = await supabaseAdmin.from("products").select("stock").eq("id", item.id).single();
        if (product) {
          await supabaseAdmin.from("products").update({ stock: Math.max(0, product.stock - item.qty) }).eq("id", item.id);
        }
      }
      return { ...order, status: "paid" };
    }
  } catch (e) {
    // If Paystack can't be reached right now, just leave it as pending --
    // it'll get checked again next time the order is viewed.
  }
  return order;
}
