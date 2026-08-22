import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dang-nhap", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
