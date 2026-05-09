/**
 * Brand Guidelines — extracted from a reference URL.
 *
 * Mirrors the structure of the Flowwwzy_Complete_Guidelines.pdf attached
 * by the operator: brand fundamentals (logo, colour, type, layout,
 * principles) + web implementation (grid, spacing, components, sections,
 * motion, web principles).
 *
 * The extractor produces this shape for any URL the operator points it
 * at. Once captured, the AI plan proposer (V3) consumes it as the
 * authoritative input for content + theme decisions, replacing the
 * thin form.moodTags + form.paletteId signal.
 */

import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────

const HexSchema = z.string().regex(/^#[0-9A-Fa-f]{3,8}$/, "Expected hex like #1A2B3C");

export const ColorEntrySchema = z.object({
  name: z.string(), //  "black", "cream", "primary"
  hex: HexSchema,
  usage: z.string(), //  "Body background", "Cursor circle, hover states"
});

export const TypeFamilySchema = z.object({
  name: z.string(), //  "Satoshi", "Söhne"
  /** Visual classification — same vocabulary as the matcher */
  classification: z.enum([
    "sans-neutral",
    "sans-humanist",
    "sans-geometric",
    "sans-grotesque",
    "serif-classic",
    "serif-modern",
    "serif-display",
    "serif-slab",
    "mono",
    "script",
  ]),
  weights: z.array(z.number().int().min(100).max(900)).default([]),
  /** Where this family is used in the system */
  role: z.enum(["display", "body", "accent", "label", "mono"]),
  /** Notes that aren't captured by the enums (e.g. "italic only") */
  notes: z.string().optional(),
});

export const TypeSizeSchema = z.object({
  fontSize: z.string(), //  "6.6rem", "62px"
  lineHeight: z.string(), //  "1.02", "1.5"
  letterSpacing: z.string().optional(), //  "-0.01em"
  weight: z.number().int(),
  /** Which family from `families` this scale entry uses (by name) */
  family: z.string(),
});

export const TypographySchema = z.object({
  families: z.array(TypeFamilySchema).min(1).max(6),
  scale: z
    .object({
      h1: TypeSizeSchema,
      h2: TypeSizeSchema,
      h3: TypeSizeSchema.optional(),
      bodyLarge: TypeSizeSchema.optional(),
      body: TypeSizeSchema,
      bodySmall: TypeSizeSchema.optional(),
      label: TypeSizeSchema.optional(),
    })
    .partial({ h3: true, bodyLarge: true, bodySmall: true, label: true }),
  /** "Italic serif inside sans heading", "Display headlines all caps", etc. */
  accentPattern: z.string().optional(),
  /** "Sans + italic serif duet" — short signature description */
  signature: z.string().optional(),
});

export const ButtonVariantSchema = z.object({
  name: z.string(), //  "primary", "dark", "tertiary"
  background: z.string(), //  "#ECECEC" or "transparent"
  text: z.string(),
  padding: z.string().optional(), //  "10px 18px"
  radius: z.string().optional(), //  ".5rem"
  hoverTreatment: z.string().optional(),
});

export const ComponentRulesSchema = z.object({
  buttons: z.array(ButtonVariantSchema).default([]),
  cornerRadii: z
    .array(z.object({ name: z.string(), value: z.string(), usage: z.string().optional() }))
    .default([]),
  shadows: z
    .array(z.object({ name: z.string(), value: z.string(), usage: z.string().optional() }))
    .default([]),
  /** "Dark backgrounds use 1px solid border, not shadows" */
  borderTreatment: z.string().optional(),
});

export const BreakpointSchema = z.object({
  name: z.string(), //  "Mobile S", "Tablet", "Desktop"
  /** "≤ 479px", "≥ 992px" */
  range: z.string(),
  behaviour: z.string().optional(),
});

export const LayoutSystemSchema = z.object({
  container: z.object({
    maxWidth: z.string(), //  "1250px"
    horizontalPadding: z.string(), //  "40px"
  }),
  breakpoints: z.array(BreakpointSchema).default([]),
  sectionPadding: z
    .object({
      default: z.string(), //  "70px 40px"
      hero: z.string().optional(),
      cta: z.string().optional(),
      whiteSection: z.string().optional(),
    })
    .partial({ hero: true, cta: true, whiteSection: true }),
  /** Common grid templates (e.g. featured projects, service blocks) */
  gridTemplates: z
    .array(
      z.object({
        useCase: z.string(),
        columns: z.string(), //  "1fr 1fr 1fr"
        gap: z.string(), //  "24px / 24px"
      })
    )
    .default([]),
});

export const SpacingSystemSchema = z.object({
  /** Token list with px+rem when both are used, or just one. */
  scale: z
    .array(
      z.object({
        value: z.string(), //  "16px / 1rem"
        usage: z.string(), //  "Card padding"
      })
    )
    .default([]),
  /** "Use 24px between related elements, 64px between sections." */
  ruleOfThumb: z.string().optional(),
});

export const MotionSystemSchema = z.object({
  easing: z
    .array(
      z.object({
        name: z.string(), //  "snappy"
        value: z.string(), //  "cubic-bezier(.165, .84, .44, 1)"
        usage: z.string().optional(),
      })
    )
    .default([]),
  durations: z
    .array(
      z.object({
        ms: z.number().int().min(0),
        property: z.string(), //  "background-color, color"
        curve: z.string().optional(), //  "linear" / "snappy"
      })
    )
    .default([]),
  hoverStates: z
    .array(z.object({ element: z.string(), treatment: z.string() }))
    .default([]),
  signatureInteractions: z.array(z.string()).default([]), //  e.g. "custom cream cursor"
});

export const DesignPrincipleSchema = z.object({
  number: z.number().int().min(1).max(12),
  title: z.string(), //  "Dark by default"
  description: z.string(),
});

export const SectionArchetypeSchema = z.object({
  type: z.enum([
    "hero",
    "featured-work",
    "services",
    "metrics",
    "stats",
    "cta",
    "testimonials",
    "pricing",
    "process",
    "faq",
    "gallery",
    "logos",
    "blog",
    "contact",
    "footer",
    "navigation",
    "other",
  ]),
  description: z.string(),
  /** "Tight H1, single primary CTA, large product screenshot below." */
  treatment: z.string().optional(),
});

// ─── Top-level schema ────────────────────────────────────────────────

export const ExtractedBrandGuidelinesSchema = z.object({
  /** Identity of the brand */
  brand: z.object({
    name: z.string(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    industry: z.string().optional(),
  }),

  logo: z.object({
    /** Where the logo image was found, if at all */
    sourceUrl: z.string().url().optional(),
    /** "wordmark", "lockup", "icon-only", "icon+wordmark" */
    style: z.enum(["wordmark", "lockup", "icon-only", "icon-and-wordmark"]),
    /** Free-text rules ("triple-W is sacred", "never reduce to single W") */
    rules: z.array(z.string()).default([]),
    /** What makes this logo distinctive — typographic detail, custom letterform, etc. */
    distinctiveFeatures: z.string().optional(),
  }),

  colorSystem: z.object({
    /** Whether the brand defaults to dark backgrounds */
    isDarkFirst: z.boolean(),
    core: z.array(ColorEntrySchema).min(1).max(12),
    accent: z.array(ColorEntrySchema).default([]),
    /** "Primary text uses white on black. Cream is decorative only." */
    defaultPairing: z.string().optional(),
  }),

  typography: TypographySchema,

  layout: LayoutSystemSchema,
  spacing: SpacingSystemSchema,
  components: ComponentRulesSchema,
  motion: MotionSystemSchema,

  designPrinciples: z.array(DesignPrincipleSchema).max(10).default([]),
  sectionArchetypes: z.array(SectionArchetypeSchema).default([]),
  webPrinciples: z.array(DesignPrincipleSchema).max(10).default([]),

  /** Free-text summary that captures what the schema can't — vibe, story, audience. 2-4 sentences. */
  summary: z.string(),
});

export type ExtractedBrandGuidelines = z.infer<typeof ExtractedBrandGuidelinesSchema>;
export type ColorEntry = z.infer<typeof ColorEntrySchema>;
export type TypeFamily = z.infer<typeof TypeFamilySchema>;
export type DesignPrinciple = z.infer<typeof DesignPrincipleSchema>;
