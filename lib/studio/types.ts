/**
 * Studio types — runtime-validated with zod.
 *
 * Three primary shapes:
 *   1. DesignDNA       — the lingua franca. Both components and references
 *                        speak it. Comparing them = comparing DNA.
 *   2. ComponentManifest — a library block + its DNA + technical wiring.
 *   3. ReferenceDNA    — a captured URL + its extracted DNA.
 *
 * The matcher (Week 2) takes a FormData from the configurator + a list of
 * ReferenceDNA, and returns a ranked list of ComponentManifest IDs per
 * page section.
 */

import { z } from "zod";
import {
  ALIGNMENTS,
  COMPONENT_CATEGORIES,
  DENSITIES,
  IMAGERY_STYLES,
  IMAGERY_TREATMENTS,
  MOOD_TAGS,
  MOTION_STYLES,
  PALETTE_IDS,
  TYPE_CLASSES,
  TYPE_FEELS,
  TYPE_PAIRINGS,
} from "./vocabulary";

// ───────────────────────────────────────────────────────────────────────────
// Hex helpers
// ───────────────────────────────────────────────────────────────────────────

const Hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Expected 6-digit hex like #1A2B3C");

// ───────────────────────────────────────────────────────────────────────────
// Sub-schemas
// ───────────────────────────────────────────────────────────────────────────

export const TypographyDNASchema = z.object({
  primary: z.enum(TYPE_CLASSES),
  pairing: z.enum(TYPE_PAIRINGS),
  feel: z.enum(TYPE_FEELS),
  /** 1-5, where 1 = subtle/quiet and 5 = loud/dominant display headlines */
  expressiveness: z.number().int().min(1).max(5),
});

export const PaletteDNASchema = z.object({
  /** Closest matching palette ID from PALETTES, picked by the matcher (not the extractor) */
  closestId: z.enum(PALETTE_IDS as [string, ...string[]]).nullable(),
  /** Raw hex values the extractor pulls from the screenshot (3-5 dominants) */
  dominantHex: z.array(Hex).min(2).max(6),
  background: Hex,
  isDarkMode: z.boolean(),
});

export const ImageryDNASchema = z.object({
  style: z.enum(IMAGERY_STYLES),
  treatment: z.enum(IMAGERY_TREATMENTS),
  /** Whether human faces appear prominently. Drives "warmth" perception. */
  showsPeople: z.boolean(),
});

export const ToneDNASchema = z.object({
  /** Mirrors the configurator sliders. 0-100. */
  profCasual: z.number().int().min(0).max(100), //  0 = formal · 100 = very casual
  calmBold: z.number().int().min(0).max(100), //  0 = serene · 100 = aggressive
  classicModern: z.number().int().min(0).max(100), //  0 = traditional · 100 = experimental
});

// ───────────────────────────────────────────────────────────────────────────
// DesignDNA — the shared shape between components and references
// ───────────────────────────────────────────────────────────────────────────

export const DesignDNASchema = z.object({
  moodTags: z.array(z.enum(MOOD_TAGS)).min(1).max(4),
  tone: ToneDNASchema,
  typography: TypographyDNASchema,
  palette: PaletteDNASchema,
  density: z.enum(DENSITIES),
  alignment: z.enum(ALIGNMENTS),
  imagery: ImageryDNASchema,
  motion: z.enum(MOTION_STYLES),
});

export type DesignDNA = z.infer<typeof DesignDNASchema>;

// ───────────────────────────────────────────────────────────────────────────
// ExtractedDNA — what the vision model emits for a reference URL.
// Slightly trimmed: the extractor doesn't know the closest palette ID
// (that's a Lab-distance computation done in the matcher with the catalog
// of named palettes). It only returns the raw dominant hex values.
// ───────────────────────────────────────────────────────────────────────────

export const ExtractedDNASchema = z.object({
  moodTags: z.array(z.enum(MOOD_TAGS)).min(1).max(4),
  tone: ToneDNASchema,
  typography: TypographyDNASchema,
  palette: z.object({
    dominantHex: z.array(Hex).min(2).max(6),
    background: Hex,
    isDarkMode: z.boolean(),
  }),
  density: z.enum(DENSITIES),
  alignment: z.enum(ALIGNMENTS),
  imagery: ImageryDNASchema,
  motion: z.enum(MOTION_STYLES),
  /** One paragraph in plain Portuguese describing the site's overall feel */
  summary: z.string().min(40).max(800),
});

export type ExtractedDNA = z.infer<typeof ExtractedDNASchema>;

// ───────────────────────────────────────────────────────────────────────────
// ContentSlot — what a component asks the generator to fill
// ───────────────────────────────────────────────────────────────────────────

export const ContentSlotSchema = z.object({
  key: z.string(), //  e.g. "headline", "subheadline", "primaryCta"
  label: z.string(), //  human-readable, for the audit UI
  type: z.enum(["text-short", "text-long", "image", "url", "list", "stat"]),
  required: z.boolean().default(true),
  maxChars: z.number().int().positive().optional(),
  /** A guidance hint for the AI that fills this slot */
  hint: z.string().optional(),
});

export type ContentSlot = z.infer<typeof ContentSlotSchema>;

// ───────────────────────────────────────────────────────────────────────────
// ComponentManifest — one library block
// ───────────────────────────────────────────────────────────────────────────

export const ComponentManifestSchema = DesignDNASchema.extend({
  /** Unique slug — stable identifier used by the matcher */
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  category: z.enum(COMPONENT_CATEGORIES),

  /** Optional sub-variants of the same block (e.g. "left-aligned", "centered") */
  variants: z.array(z.string()).optional(),

  // Wiring: where the React component lives
  filePath: z.string(), //  e.g. "components/library/heroes/HeroCenteredDisplay.tsx"
  exportName: z.string().default("default"),

  // Compatibility (computed by the matcher; here as hard overrides if needed)
  compatiblePalettes: z.array(z.enum(PALETTE_IDS as [string, ...string[]])).optional(),

  // What content this component requires
  slots: z.array(ContentSlotSchema),

  // Preview for the audit UI
  thumbnailUrl: z.string().optional(),

  /** Free-text notes for the senior designer */
  notes: z.string().optional(),
});

export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;

// ───────────────────────────────────────────────────────────────────────────
// ReferenceDNA — one captured URL + its extracted DNA
// ───────────────────────────────────────────────────────────────────────────

export const ReferenceDNASchema = DesignDNASchema.extend({
  url: z.string().url(),
  capturedAt: z.string(), //  ISO date string
  screenshotUrl: z.string().optional(), //  cached screenshot location
  /** One-paragraph free-text description from the LLM. Used for audit only — not for matching. */
  summary: z.string(),
  /** Raw model output, kept for debugging when DNA looks off */
  rawAnalysis: z.string().optional(),
});

export type ReferenceDNA = z.infer<typeof ReferenceDNASchema>;

// ───────────────────────────────────────────────────────────────────────────
// Match input/output (Week 2 — declared here so the contract is fixed early)
// ───────────────────────────────────────────────────────────────────────────

export const MatchRequestSchema = z.object({
  /** From the configurator */
  form: z.object({
    moodTags: z.array(z.enum(MOOD_TAGS)).min(1),
    tone: ToneDNASchema,
    paletteId: z.enum(PALETTE_IDS as [string, ...string[]]),
    paletteAvoidId: z.enum(PALETTE_IDS as [string, ...string[]]).nullable(),
    sections: z.array(z.enum(COMPONENT_CATEGORIES)),
  }),
  /** Up to 3 reference URLs, each with its extracted DNA */
  references: z.array(ReferenceDNASchema).max(3),
});

export type MatchRequest = z.infer<typeof MatchRequestSchema>;

export const MatchResponseSchema = z.object({
  /** One ranked list per requested section */
  picks: z.record(
    z.enum(COMPONENT_CATEGORIES),
    z.array(
      z.object({
        manifestId: z.string(),
        score: z.number(), //  0-1, higher = better fit
        reasons: z.array(z.string()), //  audit trail: why this scored where it did
      })
    )
  ),
});

export type MatchResponse = z.infer<typeof MatchResponseSchema>;
