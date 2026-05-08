/**
 * Matcher orchestrator.
 *
 * Inputs:  MatchRequest (form + references) + a library of components.
 * Output:  MatchResponse (per-section ranked picks with scores + reasons).
 *
 * Pure function. No I/O. No side effects. Easy to unit-test.
 *
 * Pipeline per request:
 *   1. Enrich each reference with closestId via Lab-distance palette match.
 *   2. For each requested section, filter library to that category.
 *   3. Score each candidate component against the request.
 *   4. Sort descending, return top picks per section.
 */

import {
  ComponentManifest,
  MatchRequest,
  MatchResponse,
  ReferenceDNA,
} from "../types";
import { ComponentCategory } from "../vocabulary";
import { findClosestPaletteId } from "./palette";
import { scoreComponent } from "./score";

const TOP_N_PER_SECTION = 5;

export function matchLibrary(
  req: MatchRequest,
  library: ComponentManifest[]
): MatchResponse {
  // 1. Enrich references — fill closestId where the extractor left null.
  const enriched: ReferenceDNA[] = req.references.map((r) => {
    if (r.palette.closestId !== null) return r;
    try {
      const { id } = findClosestPaletteId(r.palette.dominantHex);
      return { ...r, palette: { ...r.palette, closestId: id } };
    } catch {
      return r; //  no hex available; skip enrichment
    }
  });

  const enrichedReq: MatchRequest = { ...req, references: enriched };

  // 2-4. Score per requested section.
  const picks: MatchResponse["picks"] = {} as MatchResponse["picks"];

  for (const section of req.form.sections) {
    const candidates = library.filter((c) => c.category === section);

    const scored = candidates
      .map((c) => {
        const r = scoreComponent(c, enrichedReq);
        return { manifestId: c.id, score: r.score, reasons: r.reasons, passed: r.passedHardFilter };
      })
      .filter((s) => s.passed) //  drop hard-filter rejects
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N_PER_SECTION)
      .map(({ manifestId, score, reasons }) => ({ manifestId, score, reasons }));

    picks[section as ComponentCategory] = scored;
  }

  return { picks };
}

// Re-export for convenience
export { findClosestPaletteId } from "./palette";
export { scoreComponent } from "./score";
