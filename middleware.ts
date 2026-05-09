/**
 * Auth gate for the Studio.
 *
 * Protects /studio/* and /api/studio/* with an HMAC-signed cookie set
 * by /api/studio/login on successful password match. The login routes
 * themselves are public.
 *
 * Unauth UI hits → redirect to /studio/login?from=...
 * Unauth API hits → 401 JSON
 *
 * Runs on Edge runtime (Web Crypto only — no node:crypto imports).
 */

import { NextRequest, NextResponse } from "next/server";
import { STUDIO_COOKIE, verifySessionToken } from "@/lib/studio/auth";

export const config = {
  // /api/intake/* is public (token-validated inside the route);
  // /intake/* page is also public (the token IS the auth).
  matcher: ["/studio/:path*", "/api/studio/:path*"],
};

const PUBLIC_PATHS = new Set<string>([
  "/studio/login",
  "/api/studio/login",
  "/api/studio/logout",
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(STUDIO_COOKIE)?.value;
  let ok = false;
  try {
    ok = await verifySessionToken(cookie);
  } catch {
    // STUDIO_AUTH_SECRET not configured — fail closed.
    ok = false;
  }
  if (ok) return NextResponse.next();

  // Reject API calls with JSON; redirect UI calls to login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/studio/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}
