import { NextResponse } from "next/server";

// Checks the password you typed against the ADMIN_PASSWORD you set in
// your environment variables, and if it matches, gives you a cookie
// that proves you're allowed into the dashboard.
export async function POST(req) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("kabiru_admin", process.env.ADMIN_PASSWORD, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
