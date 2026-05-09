/**
 * Brand guidelines extractor — orchestrator with two-phase post-Apify
 * pipeline so each individual poll fits under Vercel's 60s ceiling.
 *
 * Polling state machine (each call ≤ 60s):
 *   1. Final cache hit?           → done (instant)
 *   2. Tmp screenshot cache hit?  → run analysis phase only (HTML+CSS+vision)
 *   3. Apify status check         → running | failed | succeeded-cache-shot
 *
 *   When Apify SUCCEEDED, we don't run analysis in the same poll — we
 *   write the resized screenshot to KV and return "running". The next
 *   poll lands at step 2 and runs analysis with a fresh 60s budget.
 *
 *   This split is what saved scale-labs.com — the heavy CSS tokenizer +
 *   Claude vision combined with screenshot fetch was overflowing 60s
 *   on a single poll.
 */

import { kickOffScreenshot, pollScreenshot } from "../extractor/screenshot";
import { enrichFromHtml, EnrichmentHints } from "../extractor/html-enrich";
import { analyzeForBrandGuidelines } from "./analyze";
import { extractCssTokens, CssTokens } from "./cssTokenizer";
import type { ExtractedBrandGuidelines } from "./types";
import { persistGet, persistSet } from "../persistentCache";

type CachedBrand = {
  guidelines: ExtractedBrandGuidelines;
  cssTokens: CssTokens;
  hints: EnrichmentHints;
  capturedAt: string;
};

/** Tmp cache between polls — bridges the Apify-done → analysis split. */
type TmpScreenshot = {
  screenshotBase64: string;
  contentType: "image/jpeg";
  apifyUrl: string;
  runDurationMs: number;
  capturedAt: string;
};

export type BrandKickOffResult =
  | { status: "running"; jobId: string }
  | {
      status: "done";
      guidelines: ExtractedBrandGuidelines;
      cssTokens: CssTokens;
      hints: EnrichmentHints;
      capturedAt: string;
    };

export type BrandPollResult =
  | { status: "running"; elapsedMs: number }
  | {
      status: "done";
      guidelines: ExtractedBrandGuidelines;
      cssTokens: CssTokens;
      hints: EnrichmentHints;
      capturedAt: string;
      timings: {
        totalMs: number;
        htmlMs?: number;
        cssMs?: number;
        analyzeMs?: number;
        runDurationMs?: number;
      };
    }
  | { status: "failed"; error: string };

// ─── Kick off ─────────────────────────────────────────────────────────

export async function kickOffBrandGuidelines(url: string): Promise<BrandKickOffResult> {
  // Persistent cache hit — skip Apify entirely.
  const cached = await persistGet<CachedBrand>("brand", url);
  if (cached) {
    return {
      status: "done",
      guidelines: cached.guidelines,
      cssTokens: cached.cssTokens,
      hints: cached.hints,
      capturedAt: cached.capturedAt,
    };
  }
  const { runId } = await kickOffScreenshot(url);
  return { status: "running", jobId: runId };
}

// ─── Poll ─────────────────────────────────────────────────────────────

export async function pollBrandGuidelines(
  jobId: string,
  url: string
): Promise<BrandPollResult> {
  const t0 = Date.now();

  // 1) Final result cache. Fast path.
  const cached = await persistGet<CachedBrand>("brand", url);
  if (cached) {
    return {
      status: "done",
      guidelines: cached.guidelines,
      cssTokens: cached.cssTokens,
      hints: cached.hints,
      capturedAt: cached.capturedAt,
      timings: { totalMs: Date.now() - t0 },
    };
  }

  // 2) Tmp screenshot cache. A previous poll already pulled the screenshot
  // from Apify; this poll runs the heavy analysis with a fresh budget.
  const tmp = await persistGet<TmpScreenshot>("brand-tmp", url);
  if (tmp) {
    return await runAnalysisPhase(url, tmp, t0);
  }

  // 3) No cache — check Apify.
  const shotResult = await pollScreenshot(jobId);
  if (shotResult.status === "running") {
    return { status: "running", elapsedMs: shotResult.elapsedMs };
  }
  if (shotResult.status === "failed") {
    return { status: "failed", error: shotResult.error };
  }

  // SUCCEEDED — write resized screenshot to tmp KV and return "running" so
  // the next poll runs analysis with a fresh 60s budget.
  const screenshot = shotResult.screenshot;
  const tmpEntry: TmpScreenshot = {
    screenshotBase64: screenshot.buffer.toString("base64"),
    contentType: "image/jpeg",
    apifyUrl: screenshot.apifyUrl,
    runDurationMs: shotResult.runDurationMs,
    capturedAt: new Date().toISOString(),
  };
  await persistSet("brand-tmp", url, tmpEntry);

  return { status: "running", elapsedMs: shotResult.runDurationMs };
}

// ─── Analysis phase (split out so each poll has a clean budget) ──────

async function runAnalysisPhase(
  url: string,
  tmp: TmpScreenshot,
  t0: number
): Promise<BrandPollResult> {
  const tHtml = Date.now();
  const [html, hints] = await Promise.all([
    fetch(url, { redirect: "follow" })
      .then((r) => r.text())
      .catch(() => ""),
    enrichFromHtml(url),
  ]);
  const htmlMs = Date.now() - tHtml;

  const tCss = Date.now();
  const cssTokens = await extractCssTokens(url, html);
  const cssMs = Date.now() - tCss;

  const tAnalyze = Date.now();
  const { guidelines } = await analyzeForBrandGuidelines(
    tmp.screenshotBase64,
    url,
    hints,
    cssTokens,
    tmp.contentType
  );
  const analyzeMs = Date.now() - tAnalyze;

  const capturedAt = new Date().toISOString();
  await persistSet<CachedBrand>("brand", url, {
    guidelines,
    cssTokens,
    hints,
    capturedAt,
  });

  return {
    status: "done",
    guidelines,
    cssTokens,
    hints,
    capturedAt,
    timings: {
      totalMs: Date.now() - t0,
      htmlMs,
      cssMs,
      analyzeMs,
      runDurationMs: tmp.runDurationMs,
    },
  };
}
