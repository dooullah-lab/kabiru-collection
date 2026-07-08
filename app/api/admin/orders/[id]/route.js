import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthed(req) {
  const cookie = req.cookies.get("kabiru_admin");
  return cookie && cookie.value === process.env.ADMIN_PASSWORD;
}

export async function PATCH(req, { params }) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const { delivery_status } = await req.json();
  const allowed = ["processing", "in_transit", "delivered"];
  if (!allowed.includes(delivery_status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const { error } = await supabaseAdmin.from("orders").update({ delivery_status }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
