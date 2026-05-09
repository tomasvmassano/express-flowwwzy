import { NextRequest, NextResponse } from "next/server";
import { kickOffExtraction, pollExtraction } from "@/lib/studio/extractor";

export const runtime = "nodejs";
export const maxDuration = 60;

const isProd = process.env.NODE_ENV === "production";

function checkAuth(req: NextRequest): NextResponse | null {
  const STUDIO_KEY = process.env.STUDIO_API_KEY;
  if (isProd && STUDIO_KEY) {
    const provided = req.headers.get("x-studio-key");
    if (provided !== STUDIO_KEY) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }
  return null;
}

/**
 * POST — kicks off an extraction job.
 *
 * Body:    { url: string }
 * Returns: { status: "running", jobId }            — Apify started, poll via GET
 *          { status: "done",    dna }              — already cached, no polling needed
 */
export async function POST(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = body?.url?.trim();
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "url_required", hint: "Pass { url: 'https://...' }" },
      { status: 400 }
    );
  }

  try {
    const result = await kickOffExtraction(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[studio/extract-reference][POST]", message);
    return NextResponse.json({ error: "kickoff_failed", message }, { status: 500 });
  }
}

/**
 * GET — polls an in-progress extraction job.
 *
 * Query:   ?jobId=...&url=...
 * Returns: { status: "running", elapsedMs }
 *          { status: "done",    dna, hints, timings }
 *          { status: "failed",  error }
 *
 * Why the URL here? We don't keep server-side state mapping jobId → URL
 * (Apify is the source of truth for the run). Client passes both back.
 * The audit UI knows the URL because it submitted it; the matcher does
 * the same on its side.
 */
export async function GET(req: NextRequest) {
  const authErr = checkAuth(req);
  if (authErr) return authErr;

  const params = req.nextUrl.searchParams;
  const jobId = params.get("jobId");
  const url = params.get("url");
  if (!jobId || !url) {
    return NextResponse.json(
      { error: "params_required", hint: "GET ?jobId=...&url=..." },
      { status: 400 }
    );
  }

  try {
    const result = await pollExtraction(jobId, url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[studio/extract-reference][GET]", message);
    return NextResponse.json({ error: "poll_failed", message }, { status: 500 });
  }
}
