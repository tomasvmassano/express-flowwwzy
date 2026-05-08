import { NextRequest, NextResponse } from "next/server";
import { extractReferenceDNA } from "@/lib/studio/extractor";

export const runtime = "nodejs";
export const maxDuration = 60; //  Vercel hobby tier ceiling; raise on Pro if needed.

const isProd = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  // Light auth — Studio is internal. Require a shared secret in production.
  const STUDIO_KEY = process.env.STUDIO_API_KEY;
  if (isProd && STUDIO_KEY) {
    const provided = req.headers.get("x-studio-key");
    if (provided !== STUDIO_KEY) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = body?.url?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "url_required", hint: "Pass { url: 'https://...' }" }, { status: 400 });
  }

  try {
    const result = await extractReferenceDNA(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[studio/extract-reference]", message);
    return NextResponse.json({ error: "extraction_failed", message }, { status: 500 });
  }
}
