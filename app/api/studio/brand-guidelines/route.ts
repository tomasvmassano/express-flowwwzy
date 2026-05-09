import { NextRequest, NextResponse } from "next/server";
import { kickOffBrandGuidelines, pollBrandGuidelines } from "@/lib/studio/brand";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/studio/brand-guidelines
 *   Body:    { url }
 *   Returns: { status: "running", jobId }
 */
export async function POST(req: NextRequest) {
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
    const result = await kickOffBrandGuidelines(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[brand-guidelines][POST]", message);
    return NextResponse.json({ error: "kickoff_failed", message }, { status: 500 });
  }
}

/**
 * GET /api/studio/brand-guidelines?jobId=...&url=...
 *   Returns: { status: "running", elapsedMs }
 *          | { status: "done", guidelines, cssTokens, hints, timings }
 *          | { status: "failed", error }
 */
export async function GET(req: NextRequest) {
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
    const result = await pollBrandGuidelines(jobId, url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[brand-guidelines][GET]", message);
    return NextResponse.json({ error: "poll_failed", message }, { status: 500 });
  }
}
