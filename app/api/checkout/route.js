import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

// This runs on the SERVER, never in the customer's browser, so it's safe
// to use the secret Paystack key here.
export async function POST(req) {
  const server = supabaseServer();
  const { data: { user } } = await server.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  const { cart, email, name, address } = await req.json();

  if (!cart || cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Re-calculate the real price from the database ourselves.
  // We never trust prices sent from the browser -- someone could edit them.
  const ids = cart.map((c) => c.id);
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let total = 0;
  const items = cart.map((c) => {
    const p = products.find((pr) => pr.id === c.id);
    const price = p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
    total += price * c.qty;
    return { id: c.id, name: p.name, size: c.size, qty: c.qty, price };
  });

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .insert({ items, total, customer_name: name, customer_email: email, customer_id: user.id, shipping_address: address, status: "pending" })
    .select()
    .single();

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 });

  // Ask Paystack to open a payment page for this amount (Paystack wants kobo, so × 100)
  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: total * 100,
      metadata: { order_id: order.id },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${order.id}`,
    }),
  });
  const paystackData = await paystackRes.json();

  if (!paystackData.status) {
    return NextResponse.json({ error: "Could not start payment" }, { status: 500 });
  }

  await supabaseAdmin.from("orders").update({ paystack_ref: paystackData.data.reference }).eq("id", order.id);

  return NextResponse.json({ authorization_url: paystackData.data.authorization_url });
}
