import { NextResponse } from "next/server";

// This runs before every visit to /admin/dashboard.
// If the visitor doesn't have the right cookie, send them to the login page.
export function middleware(req) {
  const cookie = req.cookies.get("kabiru_admin");
  if (!cookie || cookie.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/orders/:path*", "/admin/reports/:path*"],
};
