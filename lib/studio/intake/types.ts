/**
 * Post-payment intake — data shapes the client fills in via /intake/[token]
 * after Stripe checkout. Keeps the LP form short (low friction at payment),
 * pushes the full content collection (testimonials, services, FAQ, photos,
 * etc.) to a dedicated workspace.
 *
 * The intake content is stored on the Project under `intake` and feeds the
 * AI plan proposer's contentSynth as one more input (provenance tag:
 * "intake"). Sections without intake fall back to ai_synthesized.
 */

import { z } from "zod";

const ImageUrlSchema = z.string().url().or(z.literal(""));

export const IntakeServiceSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string().optional(), //  "€890" / "From €100" / ""
});

export const IntakeTestimonialSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: ImageUrlSchema.optional(),
});

export const IntakeStatSchema = z.object({
  value: z.string(), //  "94%" / "5 anos"
  label: z.string(),
});

export const IntakeProcessStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string().optional(),
});

export const IntakeFaqEntrySchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const IntakeGalleryItemSchema = z.object({
  imageUrl: ImageUrlSchema,
  caption: z.string().optional(),
});

export const IntakePricingTierSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()),
  ctaLabel: z.string().optional(),
  highlighted: z.boolean().optional(),
});

export const IntakeContactSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .default([]),
});

export const IntakeAssetsSchema = z.object({
  logoUrl: ImageUrlSchema.optional(),
  primaryColor: z.string().optional(), //  hex
  brandFonts: z.array(z.string()).default([]),
  heroImageUrl: ImageUrlSchema.optional(),
});

export const IntakeContentSchema = z.object({
  /** Free-text positioning statement. Helps AI write hero copy. */
  positioning: z.string().optional(),
  assets: IntakeAssetsSchema.default({ brandFonts: [] }),
  services: z.array(IntakeServiceSchema).default([]),
  testimonials: z.array(IntakeTestimonialSchema).default([]),
  stats: z.array(IntakeStatSchema).default([]),
  process: z.array(IntakeProcessStepSchema).default([]),
  faq: z.array(IntakeFaqEntrySchema).default([]),
  gallery: z.array(IntakeGalleryItemSchema).default([]),
  pricing: z.array(IntakePricingTierSchema).default([]),
  contact: IntakeContactSchema.default({ socialLinks: [] }),
  /** Whichever cards the client has explicitly marked as "skip". */
  skipped: z.array(z.string()).default([]),
  /** ISO date of last update */
  updatedAt: z.string().optional(),
});

export type IntakeContent = z.infer<typeof IntakeContentSchema>;
export type IntakeService = z.infer<typeof IntakeServiceSchema>;
export type IntakeTestimonial = z.infer<typeof IntakeTestimonialSchema>;
export type IntakeStat = z.infer<typeof IntakeStatSchema>;
export type IntakeProcessStep = z.infer<typeof IntakeProcessStepSchema>;
export type IntakeFaqEntry = z.infer<typeof IntakeFaqEntrySchema>;
export type IntakeGalleryItem = z.infer<typeof IntakeGalleryItemSchema>;
export type IntakePricingTier = z.infer<typeof IntakePricingTierSchema>;
export type IntakeContact = z.infer<typeof IntakeContactSchema>;
export type IntakeAssets = z.infer<typeof IntakeAssetsSchema>;

export function emptyIntake(): IntakeContent {
  return {
    assets: { brandFonts: [] },
    services: [],
    testimonials: [],
    stats: [],
    process: [],
    faq: [],
    gallery: [],
    pricing: [],
    contact: { socialLinks: [] },
    skipped: [],
  };
}
