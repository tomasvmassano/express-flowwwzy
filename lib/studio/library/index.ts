/**
 * Component library — STUB with 3 starter components.
 *
 * This is intentionally minimal. The real catalog of 40-60 components
 * lands in Week 2-3 once the matcher API is validated.
 *
 * Each manifest is hand-tagged: a senior designer fills in the
 * DesignDNA fields for each block. The matcher uses these tags to
 * decide which components fit a given client request.
 *
 * Convention:
 *   - One file per component, exporting `manifest: ComponentManifest`
 *     and `default` as the React component.
 *   - filePath relative to repo root, used by the generator (Week 3+)
 *     to import the right block.
 */

import { ComponentManifest } from "../types";

export const LIBRARY: ComponentManifest[] = [
  // ─────────── Hero ───────────
  {
    id: "hero-centered-display",
    name: "Hero — Centered Display",
    category: "hero",
    moodTags: ["minimalista", "editorial", "luxurious"],
    tone: { profCasual: 30, calmBold: 35, classicModern: 60 },
    typography: {
      primary: "serif-display",
      pairing: "display-body-pair",
      feel: "elegant",
      expressiveness: 4,
    },
    palette: {
      closestId: "black-cream",
      dominantHex: ["#000000", "#0F1010", "#FAEBE3", "#ECECEC"],
      background: "#000000",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/heroes/HeroCenteredDisplay.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "warm-sand"],
    slots: [
      { key: "label", label: "Label sobre o título", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline principal", type: "text-short", required: true, maxChars: 60 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 140 },
      { key: "primaryCta", label: "CTA principal", type: "text-short", required: true, maxChars: 24 },
      { key: "secondaryCta", label: "CTA secundário", type: "text-short", required: false, maxChars: 24 },
    ],
    notes: "Fold seguro: arejado, premium, serif italic accent.",
  },

  // ─────────── Services ───────────
  {
    id: "services-grid-3col",
    name: "Services — 3-Column Grid",
    category: "services",
    moodTags: ["clean", "minimalista", "editorial"],
    tone: { profCasual: 35, calmBold: 40, classicModern: 55 },
    typography: {
      primary: "sans-geometric",
      pairing: "single",
      feel: "neutral",
      expressiveness: 2,
    },
    palette: {
      closestId: "black-cream",
      dominantHex: ["#000000", "#0F1010", "#FAEBE3", "#ECECEC"],
      background: "#000000",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/services/ServicesGrid3Col.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "forest", "coastal"],
    slots: [
      { key: "label", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 80 },
      { key: "items", label: "3 serviços (título + descrição)", type: "list", required: true },
    ],
  },

  // ─────────── Testimonials ───────────
  {
    id: "testimonials-rotating-quote",
    name: "Testimonials — Rotating Quote",
    category: "testimonials",
    moodTags: ["editorial", "luxurious", "suave"],
    tone: { profCasual: 25, calmBold: 30, classicModern: 50 },
    typography: {
      primary: "serif-modern",
      pairing: "serif-sans-pair",
      feel: "elegant",
      expressiveness: 3,
    },
    palette: {
      closestId: "black-cream",
      dominantHex: ["#ECECEC", "#FAEBE3", "#0F1010", "#000000"],
      background: "#ECECEC",
      isDarkMode: false,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "calm",
    filePath: "components/library/testimonials/TestimonialsRotatingQuote.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "mono-plus"],
    slots: [
      { key: "label", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "quotes", label: "Lista de testemunhos (frase + autor + cargo)", type: "list", required: true },
    ],
    notes: "White island contra fundo dark. Rotaciona quotes a cada 6s.",
  },
];

/** Filter the library by category — the matcher uses this. */
export function libraryByCategory(category: string): ComponentManifest[] {
  return LIBRARY.filter((c) => c.category === category);
}
