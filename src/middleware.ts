import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";

const ADMIN_LOGIN_PATH = "/admin/masuk";
const USER_LOGIN_PATH = "/masuk";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Halaman login admin sendiri harus tetap bisa diakses tanpa session.
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  const payload = await decrypt(token);

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  if (!payload?.sub) {
    // Belum login sama sekali — lempar ke halaman login yang sesuai.
    const loginPath = pathname.startsWith("/admin") ? ADMIN_LOGIN_PATH : USER_LOGIN_PATH;
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN" && payload.role !== "APPARATUS") {
    // Login sah, tapi role-nya bukan admin/apparatus — nggak boleh masuk /admin.
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};