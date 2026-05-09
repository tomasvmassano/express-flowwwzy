/**
 * Reference URL → ReferenceDNA orchestrator (async kick-off + poll).
 *
 * Two-phase flow:
 *   kickOffExtraction(url)   →  fast: starts Apify, returns jobId.
 *   pollExtraction(jobId,url)→  cheap when Apify is still running.
 *                                When SUCCEEDED, runs HTML enrichment +
 *                                Claude vision and returns full DNA.
 *
 * The Vercel route does:
 *   POST → kickOffExtraction → returns { status: "running", jobId }
 *   GET  → pollExtraction    → returns { status: "running"|"done"|"failed", ... }
 *
 * Each individual call fits comfortably under the 60s hobby ceiling.
 */

import { ReferenceDNA } from "../types";
import { kickOffScreenshot, pollScreenshot } from "./screenshot";
import { analyzeScreenshot } from "./analyze";
import { enrichFromHtml, EnrichmentHints } from "./html-enrich";
import { getCached, setCached } from "./cache";
import { persistGet, persistSet } from "../persistentCache";

export type KickOffResult =
  | { status: "running"; jobId: string }
  | { status: "done"; dna: ReferenceDNA; fromCache: true };

export type PollResult =
  | { status: "running"; elapsedMs: number }
  | {
      status: "done";
      dna: ReferenceDNA;
      hints: EnrichmentHints;
      fromCache: boolean;
      timings: { totalMs: number; htmlMs?: number; analyzeMs?: number; runDurationMs?: number };
    }
  | { status: "failed"; error: string };

/**
 * Phase 1 — start the screenshot. Returns a jobId the caller will poll
 * with `pollExtraction(jobId, url)`. If the URL is already cached from
 * a previous extraction, returns the DNA directly without hitting Apify.
 */
export async function kickOffExtraction(url: string): Promise<KickOffResult> {
  const memCached = getCached(url);
  if (memCached) {
    return { status: "done", dna: memCached, fromCache: true };
  }
  // Persistent cache survives cold starts.
  const persisted = await persistGet<ReferenceDNA>("ref", url);
  if (persisted) {
    setCached(url, persisted); //  warm in-memory layer for this instance
    return { status: "done", dna: persisted, fromCache: true };
  }
  const { runId } = await kickOffScreenshot(url);
  return { status: "running", jobId: runId };
}

/**
 * Phase 2 — poll. The caller passes back the jobId and the original URL
 * (we don't store URL → jobId mapping; client is the source of truth).
 *
 * If Apify is still running, returns `{ status: "running", elapsedMs }`.
 * If SUCCEEDED, runs HTML enrichment + Claude vision (parallel where
 * possible) and returns the assembled ReferenceDNA.
 */
export async function pollExtraction(jobId: string, url: string): Promise<PollResult> {
  const t0 = Date.now();

  // In-memory cache check (warm function instance).
  const cached = getCached(url);
  if (cached) {
    return {
      status: "done",
      dna: cached,
      hints: { declaredFonts: [] },
      fromCache: true,
      timings: { totalMs: Date.now() - t0 },
    };
  }
  // Persistent cache (survives cold starts and previous-run timeouts).
  const persisted = await persistGet<ReferenceDNA>("ref", url);
  if (persisted) {
    setCached(url, persisted);
    return {
      status: "done",
      dna: persisted,
      hints: { declaredFonts: [] },
      fromCache: true,
      timings: { totalMs: Date.now() - t0 },
    };
  }

  const shotResult = await pollScreenshot(jobId);
  if (shotResult.status === "running") {
    return { status: "running", elapsedMs: shotResult.elapsedMs };
  }
  if (shotResult.status === "failed") {
    return { status: "failed", error: shotResult.error };
  }

  // SUCCEEDED — finish the pipeline.
  const screenshot = shotResult.screenshot;

  const tHtml = Date.now();
  const hints = await enrichFromHtml(url);
  const htmlMs = Date.now() - tHtml;

  const tAnalyze = Date.now();
  const { dna: extracted, rawJson } = await analyzeScreenshot(
    screenshot.buffer.toString("base64"),
    url,
    screenshot.contentType,
    hints
  );
  const analyzeMs = Date.now() - tAnalyze;

  const reference: ReferenceDNA = {
    url,
    capturedAt: new Date().toISOString(),
    screenshotUrl: screenshot.apifyUrl,
    summary: extracted.summary,
    rawAnalysis: rawJson,
    moodTags: extracted.moodTags,
    tone: extracted.tone,
    typography: extracted.typography,
    palette: {
      closestId: null,
      dominantHex: extracted.palette.dominantHex,
      background: extracted.palette.background,
      isDarkMode: extracted.palette.isDarkMode,
    },
    density: extracted.density,
    alignment: extracted.alignment,
    imagery: extracted.imagery,
    motion: extracted.motion,
  };

  setCached(url, reference);
  await persistSet("ref", url, reference);

  return {
    status: "done",
    dna: reference,
    hints,
    fromCache: false,
    timings: {
      totalMs: Date.now() - t0,
      htmlMs,
      analyzeMs,
      runDurationMs: shotResult.runDurationMs,
    },
  };
}
