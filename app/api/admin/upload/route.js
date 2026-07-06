import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function isAuthed(req) {
  const cookie = req.cookies.get("kabiru_admin");
  return cookie && cookie.value === process.env.ADMIN_PASSWORD;
}

// Receives an actual photo file from the admin dashboard, stores it in
// Supabase Storage, and hands back a permanent public link to use on
// the product. No more copying links from Google Drive or anywhere else.
export async function POST(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Not allowed" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "No file received" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const fileName = `${Date.now()}-${safeName}`;

  const { error } = await supabaseAdmin.storage
    .from("product-images")
    .upload(fileName, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
