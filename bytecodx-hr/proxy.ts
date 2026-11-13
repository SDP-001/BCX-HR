import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isProtected =
    request.nextUrl.pathname.startsWith("/portal") ||
    request.nextUrl.pathname.startsWith("/dashboard");
  const hasSession = Boolean(request.cookies.get("bytecodx_token")?.value);

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/dashboard/:path*"],
};
