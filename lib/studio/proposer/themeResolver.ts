/**
 * Theme resolver — given a Project, decide which paletteId + fontPair
 * to use, and where each decision came from. Pure function.
 *
 * Hierarchy:
 *   themeStrategy = "preserve" + brandGuidelines exists
 *     → paletteId from closest match to brand core colors
 *     → fontPair from typography classification of brand display font
 *     → sources: brand_guidelines / brand_guidelines_closest
 *
 *   themeStrategy = "refresh" (brand exists but client wants new look)
 *     → paletteId from form preference, fall back to AI heuristic over refs
 *     → fontPair from refs DNA (typography classification)
 *     → sources: ai_proposed
 *
 *   themeStrategy = "neutral" (no brand, default)
 *     → paletteId from form.paletteId
 *     → fontPair from refs DNA, fall back to "inter"
 *     → sources: ai_proposed (or form for paletteId)
 */

import type { Project } from "../project/types";
import type { PaletteId } from "../vocabulary";
import { TYPE_CLASS_TO_FONT_PAIR } from "@/components/library/_lib/LibraryRoot";
import { findClosestPaletteId } from "../match/palette";

export type ResolvedTheme = {
  paletteId: PaletteId;
  fontPair: string;
  themeStrategy: "preserve" | "refresh" | "neutral";
  paletteSource: "brand_guidelines" | "ai_proposed" | "operator";
  fontSource:
    | "brand_guidelines_exact"
    | "brand_guidelines_closest"
    | "ai_proposed"
    | "operator";
  reasons: string[];
};

const KNOWN_PREMIUM_FONTS = new Set([
  "Söhne", "GT America", "Founders Grotesk", "PP Editorial New", "PP Neue Montreal",
  "Söhne Schmal", "Tiempos", "Inter Tight",
]);

export function resolveTheme(project: Project): ResolvedTheme {
  const reasons: string[] = [];
  const strategy = project.form.themeStrategy ?? "neutral";
  const aspirationalRefs = project.references.filter((r) => r.purpose === "aspirational" && r.dna);

  // ─── Preserve: brand drives everything ─────────────────────────────
  if (strategy === "preserve" && project.brandGuidelines) {
    const brand = project.brandGuidelines.extracted;

    // Palette: closest match to brand core hexes
    const coreHexes = brand.colorSystem.core.map((c) => c.hex).filter(Boolean);
    const accentHexes = brand.colorSystem.accent.map((c) => c.hex).filter(Boolean);
    const allBrandHexes = [...coreHexes, ...accentHexes];

    let paletteId: PaletteId = "black-cream";
    if (allBrandHexes.length > 0) {
      const { id } = findClosestPaletteId(allBrandHexes);
      paletteId = id;
      reasons.push(`palette: closest to brand core colors (${coreHexes.slice(0, 3).join(", ")}) → ${id}`);
    } else {
      reasons.push("palette: brand had no usable hexes, defaulted black-cream");
    }

    // FontPair: pick from display font classification
    const display = brand.typography.families.find((f) => f.role === "display") || brand.typography.families[0];
    let fontPair = "inter";
    let fontSource: ResolvedTheme["fontSource"] = "ai_proposed";
    if (display) {
      fontPair = TYPE_CLASS_TO_FONT_PAIR[display.classification] || "inter";
      fontSource = KNOWN_PREMIUM_FONTS.has(display.name)
        ? "brand_guidelines_exact"
        : "brand_guidelines_closest";
      reasons.push(
        `fontPair: ${display.name} (${display.classification}) → ${fontPair} [${fontSource}]`
      );
    } else {
      reasons.push("fontPair: brand had no display family, defaulted inter");
    }

    return {
      paletteId,
      fontPair,
      themeStrategy: "preserve",
      paletteSource: "brand_guidelines",
      fontSource,
      reasons,
    };
  }

  // ─── Refresh: brand exists but client wants new look ───────────────
  if (strategy === "refresh") {
    let paletteId: PaletteId = (project.form.paletteId as PaletteId) || "black-cream";
    reasons.push(`palette: form preference (refresh) → ${paletteId}`);

    let fontPair = "inter";
    if (aspirationalRefs.length > 0) {
      const refDisplay = aspirationalRefs[0].dna!.typography.primary;
      fontPair = TYPE_CLASS_TO_FONT_PAIR[refDisplay] || "inter";
      reasons.push(`fontPair: from aspirational ref typography (${refDisplay}) → ${fontPair}`);
    } else {
      reasons.push(`fontPair: no aspirational refs, defaulted inter`);
    }

    return {
      paletteId,
      fontPair,
      themeStrategy: "refresh",
      paletteSource: "ai_proposed",
      fontSource: "ai_proposed",
      reasons,
    };
  }

  // ─── Neutral: no brand, AI proposes from form + refs ───────────────
  let paletteId: PaletteId = (project.form.paletteId as PaletteId) || "black-cream";
  reasons.push(`palette: form selection → ${paletteId}`);

  let fontPair = "inter";
  if (aspirationalRefs.length > 0) {
    const refDisplay = aspirationalRefs[0].dna!.typography.primary;
    fontPair = TYPE_CLASS_TO_FONT_PAIR[refDisplay] || "inter";
    reasons.push(`fontPair: from refs (${refDisplay}) → ${fontPair}`);
  } else {
    reasons.push(`fontPair: no refs, defaulted inter`);
  }

  return {
    paletteId,
    fontPair,
    themeStrategy: "neutral",
    paletteSource: "ai_proposed",
    fontSource: "ai_proposed",
    reasons,
  };
}
