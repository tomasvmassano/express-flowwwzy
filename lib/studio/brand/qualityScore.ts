/**
 * Heuristic quality score for extracted brand guidelines.
 *
 * Used to flag low-quality references — clients with weak existing sites
 * shouldn't have those sites driving design DNA decisions for their new
 * project. Score below 50 surfaces a warning in the audit UI; the
 * operator can still mark the ref as aspirational, just informed.
 *
 * Score is 0-100. Pure-function over the extracted shape.
 */

import type { ExtractedBrandGuidelines } from "./types";

export type QualityBreakdown = {
  score: number;
  components: {
    typographyVariety: number; //  0-25 — 1 family is bare; 2-3 is rich; 5+ implies cluttered
    colorSophistication: number; //  0-20 — too few = sparse, too many = chaotic
    typeScaleCompleteness: number; //  0-15 — h1+h2+h3+body+sm+label = full hierarchy
    designPrinciplesDepth: number; //  0-15 — having articulated principles implies brand maturity
    summaryRichness: number; //  0-10 — long, specific summary suggests the model had material to work with
    motionMaturity: number; //  0-8 — easing variants + signature interactions
    sectionVariety: number; //  0-7 — diverse section archetypes implies a real, populated site
  };
  flags: string[];
};

export function computeQualityScore(g: ExtractedBrandGuidelines): QualityBreakdown {
  const flags: string[] = [];

  // Typography variety: ideal 2-3 families. Penalize too few or too many.
  const families = g.typography.families.length;
  let typographyVariety = 0;
  if (families === 1) {
    typographyVariety = 12; //  workable but bare
    flags.push("single-font system — limited typographic personality");
  } else if (families === 2 || families === 3) {
    typographyVariety = 25;
  } else if (families === 4) {
    typographyVariety = 18;
  } else {
    typographyVariety = 8;
    flags.push("too many fonts — looks cluttered or unbranded");
  }

  // Color sophistication: 3-6 core colors is ideal.
  const coreColors = g.colorSystem.core.length;
  const accentColors = g.colorSystem.accent.length;
  let colorSophistication = 0;
  if (coreColors < 2) {
    colorSophistication = 4;
    flags.push("very thin palette — likely under-designed");
  } else if (coreColors >= 3 && coreColors <= 6) {
    colorSophistication = 16 + Math.min(4, accentColors * 2);
  } else if (coreColors > 6 && coreColors <= 9) {
    colorSophistication = 12;
  } else {
    colorSophistication = 6;
    flags.push("very large palette — risk of inconsistency");
  }

  // Type-scale completeness.
  const scaleEntries = Object.values(g.typography.scale).filter(Boolean).length;
  const typeScaleCompleteness = Math.min(15, scaleEntries * 2.5);
  if (scaleEntries < 3) flags.push("incomplete type scale (no h2/h3 distinction)");

  // Design principles depth.
  const designPrinciplesDepth = Math.min(15, g.designPrinciples.length * 3);
  if (g.designPrinciples.length === 0) {
    flags.push("no articulated design principles — likely a generic site");
  }

  // Summary richness.
  const summaryLen = (g.summary || "").length;
  const summaryRichness = Math.min(10, Math.floor(summaryLen / 40));

  // Motion maturity.
  const easingCount = g.motion.easing.length;
  const sigCount = g.motion.signatureInteractions.length;
  const motionMaturity = Math.min(8, easingCount * 2 + sigCount * 2);

  // Section variety.
  const sectionVariety = Math.min(7, g.sectionArchetypes.length);

  const score = Math.round(
    typographyVariety +
      colorSophistication +
      typeScaleCompleteness +
      designPrinciplesDepth +
      summaryRichness +
      motionMaturity +
      sectionVariety
  );

  if (score < 50) flags.unshift("low quality reference — consider not using as design DNA source");

  return {
    score,
    components: {
      typographyVariety,
      colorSophistication,
      typeScaleCompleteness,
      designPrinciplesDepth,
      summaryRichness,
      motionMaturity,
      sectionVariety,
    },
    flags,
  };
}
