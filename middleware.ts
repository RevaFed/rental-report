import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  const protectedRoutes = ["/dashboard", "/customer", "/mesin", "/report", "/riwayat", "/profile"];

  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/customer/:path*", "/mesin/:path*", "/report/:path*", "/riwayat/:path*", "/profile/:path*"],
};
