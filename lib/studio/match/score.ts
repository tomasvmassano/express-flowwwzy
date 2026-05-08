/**
 * Pure scoring function — given a component manifest and a match request,
 * returns a [0,1] score plus an audit trail of reasons.
 *
 * The scoring is deterministic, has no LLM in the loop, and never throws.
 * Components that fail the hard filter (no mood overlap with the form)
 * return score=0 and a single reason.
 *
 * Weights add up to 1.0:
 *   palette compatibility           0.40
 *   mood overlap with references    0.20
 *   tone alignment                  0.15
 *   typography match                0.10
 *   density / alignment / imagery / motion  0.025 each = 0.10
 *   reference palette resonance     0.05
 */

import { ComponentManifest, MatchRequest, ReferenceDNA } from "../types";
import { MoodTag, PaletteId } from "../vocabulary";

const WEIGHTS = {
  palette: 0.4,
  moodRefs: 0.2,
  tone: 0.15,
  typography: 0.1,
  density: 0.025,
  alignment: 0.025,
  imagery: 0.025,
  motion: 0.025,
  refPalette: 0.05,
};

export type ScoreResult = {
  score: number; //  0-1
  reasons: string[];
  passedHardFilter: boolean;
};

export function scoreComponent(
  c: ComponentManifest,
  req: MatchRequest
): ScoreResult {
  const reasons: string[] = [];

  // ── HARD FILTER: component must share at least one mood tag with the form ──
  const formMoods = new Set<MoodTag>(req.form.moodTags);
  const compMoods = new Set<MoodTag>(c.moodTags);
  const moodIntersection = c.moodTags.filter((t) => formMoods.has(t));
  if (moodIntersection.length === 0) {
    return {
      score: 0,
      reasons: [`✗ mood mismatch (form: ${req.form.moodTags.join(",")} vs comp: ${c.moodTags.join(",")})`],
      passedHardFilter: false,
    };
  }
  reasons.push(`✓ mood overlap form (${moodIntersection.join(", ")})`);

  // ── PALETTE COMPATIBILITY ──
  const formPalette = req.form.paletteId as PaletteId;
  let paletteScore = 0;
  if (!c.compatiblePalettes || c.compatiblePalettes.length === 0) {
    // Component is palette-agnostic
    paletteScore = 0.6;
    reasons.push("○ component is palette-agnostic");
  } else if (c.compatiblePalettes.includes(formPalette)) {
    paletteScore = 1;
    reasons.push(`✓ paleta exata (${formPalette})`);
  } else {
    paletteScore = 0.15;
    reasons.push(`✗ designed for ${c.compatiblePalettes.join(", ")}, form picked ${formPalette}`);
  }

  // ── MOOD OVERLAP WITH REFERENCES ──
  let moodRefsScore = 0;
  if (req.references.length > 0) {
    const overlaps = req.references.map((r) => {
      const ov = r.moodTags.filter((t) => compMoods.has(t)).length;
      return ov / Math.max(c.moodTags.length, r.moodTags.length, 1);
    });
    moodRefsScore = avg(overlaps);
    reasons.push(
      `${moodRefsScore > 0.4 ? "✓" : "△"} mood overlap refs (avg ${moodRefsScore.toFixed(2)})`
    );
  } else {
    moodRefsScore = 0.5;
    reasons.push("○ no references to score against");
  }

  // ── TONE ALIGNMENT ──
  // Form tone is the user's preference; references show what they actually
  // gravitate to. Use the form as primary, references as a soft prior.
  const targetTone =
    req.references.length > 0
      ? blendTones(req.form.tone, avgTone(req.references), 0.7)
      : req.form.tone;
  const toneDelta =
    Math.abs(targetTone.profCasual - c.tone.profCasual) +
    Math.abs(targetTone.calmBold - c.tone.calmBold) +
    Math.abs(targetTone.classicModern - c.tone.classicModern);
  // Normalize: max possible delta is 300 (3 sliders × 100)
  const toneScore = 1 - Math.min(toneDelta / 300, 1);
  reasons.push(`${toneScore > 0.7 ? "✓" : "△"} tone Δ ${toneDelta} (score ${toneScore.toFixed(2)})`);

  // ── TYPOGRAPHY MATCH ──
  let typoScore = 0;
  const refTypos = req.references.map((r) => r.typography.primary);
  if (refTypos.includes(c.typography.primary)) {
    typoScore = 1;
    reasons.push(`✓ tipografia exata (${c.typography.primary})`);
  } else if (refTypos.length > 0) {
    // Same family group? (sans-* matches sans-*, serif-* matches serif-*)
    const compFamily = c.typography.primary.split("-")[0];
    const sameFamily = refTypos.some((rt) => rt.split("-")[0] === compFamily);
    typoScore = sameFamily ? 0.5 : 0.1;
    reasons.push(`${sameFamily ? "△" : "✗"} tipografia: comp=${c.typography.primary} vs refs=[${refTypos.join(",")}]`);
  } else {
    typoScore = 0.5;
  }

  // ── REFERENCE PALETTE RESONANCE ──
  // Did the references' closest palette match the form's pick? Strong
  // signal that the user's references and stated preference align.
  let refPaletteScore = 0.5;
  if (req.references.length > 0) {
    const closestIds = req.references
      .map((r) => r.palette.closestId)
      .filter((x): x is PaletteId => x !== null);
    if (closestIds.length > 0) {
      const matches = closestIds.filter((id) => id === formPalette).length;
      refPaletteScore = matches / closestIds.length;
      reasons.push(
        `${refPaletteScore >= 0.5 ? "✓" : "△"} ${matches}/${closestIds.length} refs use ${formPalette}`
      );
    }
  }

  // ── CATEGORICAL MATCHES (density, alignment, imagery, motion) ──
  const refDensity = mode(req.references.map((r) => r.density));
  const refAlignment = mode(req.references.map((r) => r.alignment));
  const refImageryStyle = mode(req.references.map((r) => r.imagery.style));
  const refMotion = mode(req.references.map((r) => r.motion));

  const densityScore = refDensity ? (c.density === refDensity ? 1 : 0) : 0.5;
  const alignmentScore = refAlignment ? (c.alignment === refAlignment ? 1 : 0) : 0.5;
  const imageryScore = refImageryStyle ? (c.imagery.style === refImageryStyle ? 1 : 0) : 0.5;
  const motionScore = refMotion ? (c.motion === refMotion ? 1 : 0) : 0.5;

  // ── WEIGHTED TOTAL ──
  const score =
    paletteScore * WEIGHTS.palette +
    moodRefsScore * WEIGHTS.moodRefs +
    toneScore * WEIGHTS.tone +
    typoScore * WEIGHTS.typography +
    densityScore * WEIGHTS.density +
    alignmentScore * WEIGHTS.alignment +
    imageryScore * WEIGHTS.imagery +
    motionScore * WEIGHTS.motion +
    refPaletteScore * WEIGHTS.refPalette;

  return {
    score: clamp(score, 0, 1),
    reasons,
    passedHardFilter: true,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function avgTone(refs: ReferenceDNA[]): {
  profCasual: number;
  calmBold: number;
  classicModern: number;
} {
  return {
    profCasual: Math.round(avg(refs.map((r) => r.tone.profCasual))),
    calmBold: Math.round(avg(refs.map((r) => r.tone.calmBold))),
    classicModern: Math.round(avg(refs.map((r) => r.tone.classicModern))),
  };
}

function blendTones(
  primary: { profCasual: number; calmBold: number; classicModern: number },
  secondary: { profCasual: number; calmBold: number; classicModern: number },
  primaryWeight: number
) {
  const w = primaryWeight;
  return {
    profCasual: Math.round(primary.profCasual * w + secondary.profCasual * (1 - w)),
    calmBold: Math.round(primary.calmBold * w + secondary.calmBold * (1 - w)),
    classicModern: Math.round(primary.classicModern * w + secondary.classicModern * (1 - w)),
  };
}

function mode<T>(xs: T[]): T | undefined {
  if (xs.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) || 0) + 1);
  let best: T | undefined;
  let bestCount = 0;
  counts.forEach((c, k) => {
    if (c > bestCount) {
      bestCount = c;
      best = k;
    }
  });
  return best;
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}
