/**
 * Closed vocabularies for the Studio system.
 *
 * Every tag the matcher reasons about MUST come from one of these lists.
 * The form picks from a subset of moods/palettes; the reference extractor
 * is allowed the full vocabulary so it can capture nuance the form can't.
 *
 * Why closed? An open vocabulary lets the LLM drift. With a fixed set, two
 * runs over the same URL produce the same DNA, and the matcher becomes
 * deterministic instead of "vibes".
 */

// ───────────────────────────────────────────────────────────────────────────
// MOOD TAGS
// The 6 marked formExposed:true are the ones the configurator surfaces.
// References can hit any of the 14 — the extra ones are nuances the form
// doesn't ask about but that legitimately differentiate component picks.
// ───────────────────────────────────────────────────────────────────────────

export const MOOD_TAGS = [
  // form-exposed
  "minimalista",
  "bold",
  "suave",
  "tech",
  "caloroso",
  "clean",
  // extended (extractor only)
  "editorial",
  "luxurious",
  "playful",
  "industrial",
  "organic",
  "futuristic",
  "retro",
  "brutalist",
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];

export const FORM_EXPOSED_MOODS: MoodTag[] = [
  "minimalista",
  "bold",
  "suave",
  "tech",
  "caloroso",
  "clean",
];

// ───────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY CLASSIFICATION
// Each value carries a clear visual signature. The matcher uses these to
// pair components with references — a "humanist sans" reference shouldn't
// match a "geometric sans" component, even though both are "sans".
// ───────────────────────────────────────────────────────────────────────────

export const TYPE_CLASSES = [
  "sans-neutral", //  Inter, Helvetica, Söhne — workhorse
  "sans-humanist", //  Open Sans, Source Sans, Lato — warm
  "sans-geometric", //  Geist, Satoshi, Circular — modern
  "sans-grotesque", //  Akzidenz, Founders Grotesk — editorial
  "serif-classic", //  Caslon, Garamond — traditional
  "serif-modern", //  Tiempos, Söhne Schmal — refined
  "serif-display", //  STIX, Fraunces, Recoleta — character heads
  "serif-slab", //  Roboto Slab, Tisa — tech-leaning
  "mono", //  JetBrains, Geist Mono — code aesthetic
  "script", //  hand-drawn, calligraphic — rare
] as const;

export type TypeClass = (typeof TYPE_CLASSES)[number];

export const TYPE_PAIRINGS = [
  "single", //  one family, multiple weights
  "sans-serif-pair", //  e.g. Geist + Instrument Serif
  "serif-sans-pair", //  e.g. Fraunces + Inter
  "display-body-pair", //  e.g. PP Editorial + Söhne
] as const;

export type TypePairing = (typeof TYPE_PAIRINGS)[number];

export const TYPE_FEELS = [
  "neutral",
  "humanist",
  "geometric",
  "industrial",
  "elegant",
  "playful",
] as const;

export type TypeFeel = (typeof TYPE_FEELS)[number];

// ───────────────────────────────────────────────────────────────────────────
// LAYOUT
// ───────────────────────────────────────────────────────────────────────────

export const DENSITIES = ["tight", "comfortable", "airy"] as const;
export type Density = (typeof DENSITIES)[number];

export const ALIGNMENTS = ["centered", "left", "asymmetric"] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

// ───────────────────────────────────────────────────────────────────────────
// IMAGERY
// ───────────────────────────────────────────────────────────────────────────

export const IMAGERY_STYLES = [
  "photographic",
  "illustration",
  "abstract",
  "minimal-none",
] as const;
export type ImageryStyle = (typeof IMAGERY_STYLES)[number];

export const IMAGERY_TREATMENTS = [
  "raw", //  untreated photography
  "graded", //  color-corrected, cinematic
  "duotone", //  two-tone overlay
  "high-contrast", //  pushed contrast
  "soft", //  faded, low contrast
] as const;
export type ImageryTreatment = (typeof IMAGERY_TREATMENTS)[number];

// ───────────────────────────────────────────────────────────────────────────
// MOTION
// References show motion by side-effect (e.g. obvious loaders, animated
// gradients). Often "static" because the screenshot can't show motion;
// the matcher down-weights this when uncertain.
// ───────────────────────────────────────────────────────────────────────────

export const MOTION_STYLES = ["snappy", "calm", "dramatic", "static"] as const;
export type MotionStyle = (typeof MOTION_STYLES)[number];

// ───────────────────────────────────────────────────────────────────────────
// COMPONENT CATEGORIES
// What kind of block this is in a page. Used to filter the library when
// the form picks `sections: [...]`.
// ───────────────────────────────────────────────────────────────────────────

export const COMPONENT_CATEGORIES = [
  "hero",
  "services",
  "about",
  "testimonials",
  "faq",
  "contact",
  "gallery",
  "blog",
  "pricing",
  "stats",
  "logos",
  "process",
  "cta",
  "footer",
  "navigation",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

// ───────────────────────────────────────────────────────────────────────────
// PALETTES (form-exposed)
// Same 8 the configurator shows. The matcher uses these IDs as the hard
// constraint; the extractor returns raw hex values that are then mapped
// to the closest palette via Lab-space distance (added in match step).
// ───────────────────────────────────────────────────────────────────────────

export const PALETTES = {
  "black-cream": { name: "Black & Cream", hex: ["#000000", "#0F1010", "#FAEBE3", "#ECECEC"] },
  forest: { name: "Forest", hex: ["#0F1F1A", "#2D4A3E", "#A8B89A", "#F5F1E8"] },
  coastal: { name: "Coastal", hex: ["#0F2027", "#2C5364", "#88C8E0", "#F0F4F8"] },
  "warm-sand": { name: "Warm Sand", hex: ["#1F1611", "#5C3A21", "#D9A876", "#F5EDE3"] },
  "bold-red": { name: "Bold Red", hex: ["#100808", "#8B1E1E", "#E8B871", "#F8F4EE"] },
  royal: { name: "Royal", hex: ["#0E1B2C", "#1B3A6B", "#C9A876", "#F5F1E8"] },
  "mono-plus": { name: "Mono Plus", hex: ["#000000", "#3A3A3A", "#B3B3B3", "#FCFCFC"] },
  sunset: { name: "Sunset", hex: ["#1A0F1A", "#5C2D5C", "#F08C5C", "#FAEBE3"] },
} as const;

export type PaletteId = keyof typeof PALETTES;
export const PALETTE_IDS = Object.keys(PALETTES) as PaletteId[];
