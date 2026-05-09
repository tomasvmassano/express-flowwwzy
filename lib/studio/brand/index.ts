/**
 * Brand guidelines extractor — orchestrator.
 *
 * Re-uses the screenshot pipeline (Apify async kick-off + poll) so we
 * stay under the 60s Vercel ceiling. Adds the CSS deep tokenizer and
 * the brand-guidelines vision call on top.
 *
 * Two-phase API mirrors the reference extractor:
 *   kickOffBrandGuidelines(url) → { jobId } | { done, guidelines }
 *   pollBrandGuidelines(jobId, url) → running | done | failed
 */

import { kickOffScreenshot, pollScreenshot } from "../extractor/screenshot";
import { enrichFromHtml, EnrichmentHints } from "../extractor/html-enrich";
import { analyzeForBrandGuidelines } from "./analyze";
import { extractCssTokens, CssTokens } from "./cssTokenizer";
import type { ExtractedBrandGuidelines } from "./types";

export type BrandKickOffResult =
  | { status: "running"; jobId: string }
  | { status: "done"; guidelines: ExtractedBrandGuidelines; cssTokens: CssTokens; hints: EnrichmentHints; capturedAt: string };

export type BrandPollResult =
  | { status: "running"; elapsedMs: number }
  | {
      status: "done";
      guidelines: ExtractedBrandGuidelines;
      cssTokens: CssTokens;
      hints: EnrichmentHints;
      capturedAt: string;
      timings: { totalMs: number; htmlMs?: number; cssMs?: number; analyzeMs?: number; runDurationMs?: number };
    }
  | { status: "failed"; error: string };

export async function kickOffBrandGuidelines(url: string): Promise<BrandKickOffResult> {
  const { runId } = await kickOffScreenshot(url);
  return { status: "running", jobId: runId };
}

export async function pollBrandGuidelines(
  jobId: string,
  url: string
): Promise<BrandPollResult> {
  const t0 = Date.now();

  const shotResult = await pollScreenshot(jobId);
  if (shotResult.status === "running") {
    return { status: "running", elapsedMs: shotResult.elapsedMs };
  }
  if (shotResult.status === "failed") {
    return { status: "failed", error: shotResult.error };
  }

  // SUCCEEDED — fetch HTML, analyze CSS, run vision (parallel where safe).
  const tHtml = Date.now();
  const html = await fetch(url, { redirect: "follow" }).then((r) => r.text()).catch(() => "");
  const hints = await enrichFromHtml(url);
  const htmlMs = Date.now() - tHtml;

  const tCss = Date.now();
  const cssTokens = await extractCssTokens(url, html);
  const cssMs = Date.now() - tCss;

  const tAnalyze = Date.now();
  const screenshot = shotResult.screenshot;
  const { guidelines } = await analyzeForBrandGuidelines(
    screenshot.buffer.toString("base64"),
    url,
    hints,
    cssTokens,
    screenshot.contentType
  );
  const analyzeMs = Date.now() - tAnalyze;

  return {
    status: "done",
    guidelines,
    cssTokens,
    hints,
    capturedAt: new Date().toISOString(),
    timings: {
      totalMs: Date.now() - t0,
      htmlMs,
      cssMs,
      analyzeMs,
      runDurationMs: shotResult.runDurationMs,
    },
  };
}
