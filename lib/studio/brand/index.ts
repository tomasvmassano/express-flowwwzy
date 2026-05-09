/**
 * Brand guidelines extractor — multi-stage pipeline.
 *
 * Each individual poll runs as much as fits in a 50s budget. Stages:
 *
 *   0. screenshot   Apify run → fetch + sharp resize → KV "brand-shot"
 *   1. html-data    HTML fetch + CSS deep tokenizer  → KV "brand-html"
 *   2. identity     Claude vision (small)            → KV "brand-stage-identity"
 *   3. visuals      Claude vision (logo + colors)    → KV "brand-stage-visuals"
 *   4. technical    Claude vision (typo + layout)    → KV "brand-stage-technical"
 *   5. principles   Claude vision (rules + motion)   → KV "brand-stage-principles"
 *   6. assemble     Merge fragments → ExtractedBrandGuidelines → KV "brand"
 *
 * Each Claude stage is 5-12s. Each poll handles whatever fits in 50s
 * before returning "running" with stage status. The operator sees per-
 * stage progress in the UI ("Identity ✓", "Visuals ⏳").
 *
 * If a single stage fails, others continue; the operator can re-extract
 * just that stage by clearing its cache.
 */

import { kickOffScreenshot, pollScreenshot } from "../extractor/screenshot";
import { enrichFromHtml, EnrichmentHints } from "../extractor/html-enrich";
import { extractCssTokens, CssTokens } from "./cssTokenizer";
import type { ExtractedBrandGuidelines } from "./types";
import { persistGet, persistSet } from "../persistentCache";
import {
  IdentityFragment,
  VisualsFragment,
  TechnicalFragment,
  PrinciplesFragment,
  runIdentityStage,
  runVisualsStage,
  runTechnicalStage,
  runPrinciplesStage,
} from "./stages";

// ─── Cache shapes ─────────────────────────────────────────────────────

type CachedBrand = {
  guidelines: ExtractedBrandGuidelines;
  cssTokens: CssTokens;
  hints: EnrichmentHints;
  capturedAt: string;
};

type CachedShot = {
  screenshotBase64: string;
  contentType: "image/jpeg";
  apifyUrl: string;
  runDurationMs: number;
};

type CachedHtmlData = {
  hints: EnrichmentHints;
  cssTokens: CssTokens;
};

type StageStatus =
  | { state: "pending" }
  | { state: "done"; durationMs: number }
  | { state: "failed"; error: string };

export type StageMap = {
  screenshot: StageStatus;
  htmlData: StageStatus;
  identity: StageStatus;
  visuals: StageStatus;
  technical: StageStatus;
  principles: StageStatus;
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
  | {
      status: "running";
      elapsedMs: number;
      stages: StageMap;
    }
  | {
      status: "done";
      guidelines: ExtractedBrandGuidelines;
      cssTokens: CssTokens;
      hints: EnrichmentHints;
      capturedAt: string;
      stages: StageMap;
    }
  | { status: "failed"; error: string };

// Per-poll budget — leave 10s headroom under Vercel hobby ceiling.
const POLL_BUDGET_MS = 50_000;

// ─── Public API ──────────────────────────────────────────────────────

export async function kickOffBrandGuidelines(url: string): Promise<BrandKickOffResult> {
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
  // If screenshot already cached (previous poll persisted it), skip Apify.
  // Poll uses cached shot directly — jobId is irrelevant in that path.
  const cachedShot = await persistGet<CachedShot>("brand-shot", url);
  if (cachedShot) {
    return { status: "running", jobId: "cached" };
  }
  const { runId } = await kickOffScreenshot(url);
  return { status: "running", jobId: runId };
}

export async function pollBrandGuidelines(
  jobId: string,
  url: string
): Promise<BrandPollResult> {
  const t0 = Date.now();

  // ─── Final result ──
  const cachedFinal = await persistGet<CachedBrand>("brand", url);
  if (cachedFinal) {
    return {
      status: "done",
      guidelines: cachedFinal.guidelines,
      cssTokens: cachedFinal.cssTokens,
      hints: cachedFinal.hints,
      capturedAt: cachedFinal.capturedAt,
      stages: allDoneStages(),
    };
  }

  const stages: StageMap = {
    screenshot: { state: "pending" },
    htmlData: { state: "pending" },
    identity: { state: "pending" },
    visuals: { state: "pending" },
    technical: { state: "pending" },
    principles: { state: "pending" },
  };

  // ─── Stage 0: screenshot ──
  let shot = await persistGet<CachedShot>("brand-shot", url);
  if (shot) {
    stages.screenshot = { state: "done", durationMs: 0 };
  } else {
    if (Date.now() - t0 > POLL_BUDGET_MS) {
      return runningResult(stages, t0, undefined);
    }
    const tShot = Date.now();
    const sr = await pollScreenshot(jobId);
    if (sr.status === "running") {
      return { status: "running", elapsedMs: sr.elapsedMs, stages };
    }
    if (sr.status === "failed") {
      return { status: "failed", error: sr.error };
    }
    shot = {
      screenshotBase64: sr.screenshot.buffer.toString("base64"),
      contentType: "image/jpeg",
      apifyUrl: sr.screenshot.apifyUrl,
      runDurationMs: sr.runDurationMs,
    };
    await persistSet("brand-shot", url, shot);
    stages.screenshot = { state: "done", durationMs: Date.now() - tShot };
  }

  // ─── Stage 1: html data ──
  let html = await persistGet<CachedHtmlData>("brand-html", url);
  if (html) {
    stages.htmlData = { state: "done", durationMs: 0 };
  } else {
    if (Date.now() - t0 > POLL_BUDGET_MS) {
      return runningResult(stages, t0, shot.runDurationMs);
    }
    const tHtml = Date.now();
    try {
      const [rawHtml, hints] = await Promise.all([
        fetch(url, { redirect: "follow" })
          .then((r) => r.text())
          .catch(() => ""),
        enrichFromHtml(url),
      ]);
      const cssTokens = await extractCssTokens(url, rawHtml);
      html = { hints, cssTokens };
      await persistSet("brand-html", url, html);
      stages.htmlData = { state: "done", durationMs: Date.now() - tHtml };
    } catch (e) {
      stages.htmlData = { state: "failed", error: String(e) };
      // Continue — analysis stages can still run with empty hints/css.
      html = { hints: { declaredFonts: [] }, cssTokens: emptyCssTokens() };
    }
  }

  // ─── Stage 2-5: vision fragments ──
  const stageDefs = [
    { key: "identity" as const, run: runIdentityStage },
    { key: "visuals" as const, run: runVisualsStage },
    { key: "technical" as const, run: runTechnicalStage },
    { key: "principles" as const, run: runPrinciplesStage },
  ];

  const fragments: {
    identity?: IdentityFragment;
    visuals?: VisualsFragment;
    technical?: TechnicalFragment;
    principles?: PrinciplesFragment;
  } = {};

  for (const def of stageDefs) {
    type Frag = IdentityFragment | VisualsFragment | TechnicalFragment | PrinciplesFragment;
    const cached = await persistGet<{ data: Frag; durationMs: number }>(
      `brand-stage-${def.key}`,
      url
    );
    if (cached) {
      stages[def.key] = { state: "done", durationMs: cached.durationMs };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fragments as any)[def.key] = cached.data;
      continue;
    }

    if (Date.now() - t0 > POLL_BUDGET_MS) {
      return runningResult(stages, t0, shot.runDurationMs);
    }

    const tStage = Date.now();
    try {
      const data = await def.run(
        shot.screenshotBase64,
        shot.contentType,
        url,
        html.hints,
        html.cssTokens
      );
      const durationMs = Date.now() - tStage;
      await persistSet(`brand-stage-${def.key}`, url, { data, durationMs });
      stages[def.key] = { state: "done", durationMs };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fragments as any)[def.key] = data;
    } catch (e) {
      stages[def.key] = { state: "failed", error: String(e) };
      // Continue to next stage rather than aborting the whole pipeline.
    }
  }

  // ─── Assembly ──
  if (
    fragments.identity &&
    fragments.visuals &&
    fragments.technical &&
    fragments.principles
  ) {
    const guidelines: ExtractedBrandGuidelines = {
      brand: fragments.identity.brand,
      summary: fragments.identity.summary,
      logo: fragments.visuals.logo,
      colorSystem: fragments.visuals.colorSystem,
      typography: fragments.technical.typography,
      layout: fragments.technical.layout,
      components: fragments.technical.components,
      spacing: { scale: [], ruleOfThumb: undefined },
      motion: fragments.principles.motion,
      designPrinciples: fragments.principles.designPrinciples,
      sectionArchetypes: fragments.principles.sectionArchetypes,
      webPrinciples: fragments.principles.webPrinciples,
    };
    const capturedAt = new Date().toISOString();
    await persistSet<CachedBrand>("brand", url, {
      guidelines,
      cssTokens: html.cssTokens,
      hints: html.hints,
      capturedAt,
    });
    return {
      status: "done",
      guidelines,
      cssTokens: html.cssTokens,
      hints: html.hints,
      capturedAt,
      stages,
    };
  }

  // Some stages still pending — return progress, client polls again.
  return runningResult(stages, t0, shot.runDurationMs);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function runningResult(
  stages: StageMap,
  t0: number,
  runDurationMs?: number
): BrandPollResult {
  const elapsedMs = runDurationMs ?? Date.now() - t0;
  return { status: "running", elapsedMs, stages };
}

function allDoneStages(): StageMap {
  const s: StageStatus = { state: "done", durationMs: 0 };
  return {
    screenshot: s,
    htmlData: s,
    identity: s,
    visuals: s,
    technical: s,
    principles: s,
  };
}

function emptyCssTokens(): CssTokens {
  return {
    colorFrequencies: {},
    fontFamilies: [],
    cssVariables: {},
    mediaBreakpoints: [],
    fontSizeValues: [],
    radiusValues: [],
    spacingValues: [],
    easingValues: [],
    stylesheetsRead: 0,
    stylesheetsFailed: [],
  };
}
