/**
 * Reference URL → ReferenceDNA orchestrator.
 *
 * Pipeline:
 *   url → cache hit? return.
 *   url → screenshot (Apify) → analyze (Claude vision) → assemble → cache → return.
 *
 * The orchestrator is the only file the API route imports. Screenshot and
 * analyze stay isolated so they can be tested independently.
 */

import { ReferenceDNA } from "../types";
import { takeScreenshot } from "./screenshot";
import { analyzeScreenshot } from "./analyze";
import { getCached, setCached } from "./cache";

export type ExtractResult = {
  dna: ReferenceDNA;
  fromCache: boolean;
  timings: { totalMs: number; screenshotMs?: number; analyzeMs?: number };
};

export async function extractReferenceDNA(url: string): Promise<ExtractResult> {
  const t0 = Date.now();

  const cached = getCached(url);
  if (cached) {
    return { dna: cached, fromCache: true, timings: { totalMs: Date.now() - t0 } };
  }

  const tShot = Date.now();
  const shot = await takeScreenshot(url);
  const screenshotMs = Date.now() - tShot;

  const tAnalyze = Date.now();
  const { dna: extracted, rawJson } = await analyzeScreenshot(
    shot.buffer.toString("base64"),
    url
  );
  const analyzeMs = Date.now() - tAnalyze;

  // Assemble the final ReferenceDNA. closestId stays null until the matcher
  // computes Lab-distance against the named palette catalog.
  const reference: ReferenceDNA = {
    url,
    capturedAt: new Date().toISOString(),
    screenshotUrl: shot.apifyUrl,
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

  return {
    dna: reference,
    fromCache: false,
    timings: { totalMs: Date.now() - t0, screenshotMs, analyzeMs },
  };
}
