/**
 * AI Plan Proposer — orchestrator.
 *
 * Pipeline:
 *   1. resolveTheme(project)           → palette + fontPair + sources
 *   2. buildCanonStructure(project)    → canon section list
 *   3. pickBlocks(canon, project)      → manifestId per category via matcher
 *   4. synthesizeContent(...)          → Claude API fills slots
 *   5. assemble ProjectPlan with audit fields and return
 */

import type { Project, ProjectPlan, PlanSection } from "../project/types";
import type { ComponentManifest, MatchRequest } from "../types";
import { LIBRARY } from "../library";
import { matchLibrary } from "../match";
import { CANON, pickHeroManifestId } from "./canon";
import { resolveTheme } from "./themeResolver";
import { synthesizeAllSectionContent, SectionToFill } from "./contentSynth";

export type ProposerResult = {
  plan: ProjectPlan;
  reasons: string[];
  warnings: string[];
};

export async function proposePlan(project: Project): Promise<ProposerResult> {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // 1. Theme
  const theme = resolveTheme(project);
  reasons.push(...theme.reasons);

  // 2. Build canon section skeleton
  const moodTags = project.form.moodTags || [];
  const heroManifestId = pickHeroManifestId(project.form.vsl?.state || "no_vsl", moodTags);

  const canonSections = CANON.map((slot, i) => {
    if (slot.category === "hero") {
      return {
        order: slot.order,
        category: slot.category,
        manifestId: heroManifestId,
        rationale: `${slot.rationale}; hero variant chosen by VSL signal (${project.form.vsl?.state || "no_vsl"})`,
      };
    }
    return {
      order: slot.order,
      category: slot.category,
      manifestId: "", //  filled by matcher below
      rationale: slot.rationale,
    };
  });

  // 3. Pick blocks for each non-hero canon category via matcher
  const formMoodForMatcher = (moodTags.length > 0 ? moodTags : ["clean"]) as ("minimalista" | "bold" | "suave" | "tech" | "caloroso" | "clean")[];
  const aspirationalRefs = project.references
    .filter((r) => r.purpose === "aspirational" && r.dna)
    .map((r) => r.dna!);

  const matchRequest: MatchRequest = {
    form: {
      moodTags: formMoodForMatcher,
      tone: project.form.tone,
      paletteId: theme.paletteId,
      paletteAvoidId: (project.form.paletteAvoidId as MatchRequest["form"]["paletteAvoidId"]) || null,
      sections: canonSections.map((s) => s.category) as MatchRequest["form"]["sections"],
    },
    references: aspirationalRefs,
  };

  const matchResp = matchLibrary(matchRequest, LIBRARY);

  for (const sec of canonSections) {
    if (sec.manifestId) continue; //  hero already assigned
    const picks = matchResp.picks[sec.category as keyof typeof matchResp.picks];
    if (picks && picks.length > 0) {
      sec.manifestId = picks[0].manifestId;
      sec.rationale += `; matcher top pick (score ${picks[0].score.toFixed(2)})`;
    } else {
      // No matcher pick — fall back to first library block in the category.
      const fallback = LIBRARY.find((c) => c.category === sec.category);
      if (fallback) {
        sec.manifestId = fallback.id;
        sec.rationale += `; matcher returned no picks, fell back to first library block`;
        warnings.push(`No matcher picks for ${sec.category}; using fallback ${fallback.id}`);
      } else {
        warnings.push(`No library block exists for canon category ${sec.category} — section dropped`);
      }
    }
  }

  // 4. Drop any sections with no manifestId (shouldn't happen if library is complete)
  const usableCanon = canonSections.filter((s) => s.manifestId);

  // 5. Synthesize content for all sections in one Claude call
  const sectionsToFill: SectionToFill[] = usableCanon.map((s, i) => {
    const manifest = LIBRARY.find((m) => m.id === s.manifestId);
    if (!manifest) throw new Error(`Manifest not found for ${s.manifestId}`);
    return {
      sectionId: `s${i}_${s.category}`,
      category: s.category,
      manifestId: s.manifestId,
      manifest,
    };
  });

  let contentBySection: Record<string, Record<string, unknown>> = {};
  try {
    contentBySection = await synthesizeAllSectionContent(project, sectionsToFill);
  } catch (err) {
    warnings.push(`Content synthesis failed: ${String(err)}; sections will have empty slot content`);
  }

  // 6. Assemble the PlanSection list
  const planSections: PlanSection[] = sectionsToFill.map((s, i) => {
    const content = contentBySection[s.sectionId] || {};
    // Build per-slot provenance: every value gets ai_synthesized for V1.
    // V2 can override based on intake or brand_guidelines pulls.
    const contentSources: Record<string, "ai_synthesized" | "brand_guidelines" | "form" | "operator" | "intake" | "current_site"> = {};
    for (const slot of s.manifest.slots) {
      contentSources[slot.key] = "ai_synthesized";
    }

    return {
      category: usableCanon[i].category as PlanSection["category"],
      manifestId: s.manifestId,
      content,
      source: "canon",
      positionRationale: usableCanon[i].rationale,
      contentSources,
      confidence: 0.75,
    };
  });

  const plan: ProjectPlan = {
    sections: planSections,
    fontPair: theme.fontPair,
    paletteId: theme.paletteId,
    themeStrategy: theme.themeStrategy,
    paletteSource: theme.paletteSource,
    fontSource: theme.fontSource,
    proposedAt: new Date().toISOString(),
  };

  return { plan, reasons, warnings };
}
