import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get("session");

  // Kalau belum login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ambil user berdasarkan ID session
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${encodeURIComponent(session.value)}&select=id,role,is_active`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const users = await response.json();
    const user = users?.[0];

    // Session tidak valid
    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete("session");

      return response;
    }

    // Akun nonaktif
    if (user.is_active === false) {
      const response = NextResponse.redirect(new URL("/login", request.url));

      response.cookies.delete("session");

      return response;
    }

    // =====================================================
    // ADMIN
    // =====================================================

    if (pathname.startsWith("/admin")) {
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return NextResponse.next();
    }

    // =====================================================
    // TEKNISI
    // =====================================================

    const technicianRoutes = ["/dashboard", "/customer", "/mesin", "/report", "/riwayat", "/profile"];

    const isTechnicianRoute = technicianRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (isTechnicianRoute) {
      if (user.role !== "teknisi") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/customer/:path*", "/mesin/:path*", "/report/:path*", "/riwayat/:path*", "/profile/:path*"],
};
