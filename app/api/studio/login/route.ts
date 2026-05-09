import { NextRequest, NextResponse } from "next/server";
import { signSessionToken, STUDIO_COOKIE, STUDIO_COOKIE_MAX_AGE_S } from "@/lib/studio/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const expected = process.env.STUDIO_PASSWORD;
  if (!expected || expected.length < 6) {
    return NextResponse.json(
      { error: "not_configured", message: "STUDIO_PASSWORD missing or too short" },
      { status: 500 }
    );
  }

  const provided = (body?.password || "").trim();
  // Add small artificial delay so timing doesn't leak whether the password
  // existed at all — crude but better than nothing for an internal tool.
  await new Promise((r) => setTimeout(r, 200));
  if (provided !== expected) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }

  let token: string;
  try {
    token = await signSessionToken();
  } catch (err) {
    return NextResponse.json(
      { error: "auth_secret_not_configured", message: String(err) },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STUDIO_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STUDIO_COOKIE_MAX_AGE_S,
  });
  return res;
}
