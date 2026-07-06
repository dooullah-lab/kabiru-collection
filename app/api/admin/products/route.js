import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthed(req) {
  const cookie = req.cookies.get("kabiru_admin");
  return cookie && cookie.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const body = await req.json();
  const { error, data } = await supabaseAdmin.from("products").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
