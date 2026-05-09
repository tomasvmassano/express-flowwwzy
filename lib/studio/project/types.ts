/**
 * Project — the unit of work that flows through the Studio pipeline.
 *
 * Lifecycle (state machine):
 *
 *   draft        manual creation; no payment yet (operator testing, demos).
 *   paid         Stripe webhook fired; configurator data captured.
 *   extracting   background workers running: ref DNA + brand-guide parse.
 *   ready_audit  all data collected; awaiting operator review.
 *   audited      operator approved the AI-proposed plan.
 *   generating   generator assembling project files.
 *   deployed     Vercel deploy succeeded; URL available.
 *   delivered    confirmation email sent to client.
 *   failed       any phase failed; failureReason explains.
 *
 * Forward-only transitions in normal flow. `failed` can be retried by
 * the operator (resets to the previous valid state).
 */

import { z } from "zod";
import { Tier } from "@/lib/types";
import { ReferenceDNASchema } from "@/lib/studio/types";
import { ExtractedBrandGuidelinesSchema } from "@/lib/studio/brand/types";
import {
  COMPONENT_CATEGORIES,
  PALETTE_IDS,
} from "@/lib/studio/vocabulary";

// ─── State machine ─────────────────────────────────────────────────────

export const PROJECT_STATES = [
  "draft",
  "paid",
  "extracting",
  "ready_audit",
  "audited",
  "generating",
  "deployed",
  "delivered",
  "failed",
] as const;

export type ProjectState = (typeof PROJECT_STATES)[number];

const ProjectStateSchema = z.enum(PROJECT_STATES);

// ─── Reference (one URL inside a project) ──────────────────────────────

const EnrichmentHintsSchema = z.object({
  declaredFonts: z.array(z.string()),
  themeColor: z.string().optional(),
  pageTitle: z.string().optional(),
  pageDescription: z.string().optional(),
  language: z.string().optional(),
  ogImageUrl: z.string().optional(),
});

/** Why a reference URL is in the project. Drives how it's used downstream. */
export const REFERENCE_PURPOSES = ["aspirational", "current_site", "competitor"] as const;
export type ReferencePurpose = (typeof REFERENCE_PURPOSES)[number];

export const ProjectReferenceSchema = z.object({
  url: z.string().url(),
  /** aspirational = used for design DNA matching;
   *  current_site = used for content extraction (copy, services, contacts), NOT design;
   *  competitor   = differentiation signal (don't look like this). */
  purpose: z.enum(REFERENCE_PURPOSES).default("aspirational"),
  status: z.enum(["pending", "extracting", "done", "failed"]),
  jobId: z.string().optional(),
  dna: ReferenceDNASchema.optional(),
  hints: EnrichmentHintsSchema.optional(),
  /** 0-100 heuristic score from extracted DNA. <50 surfaces a quality warning. */
  qualityScore: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
});

export type ProjectReference = z.infer<typeof ProjectReferenceSchema>;

// ─── Brand guidelines ──────────────────────────────────────────────────

export const BrandGuidelinesSchema = z.object({
  /** Where the guidelines came from. URL = extracted from existing site;
   *  upload = client uploaded a PDF/image (V2 file uploads). */
  source: z.discriminatedUnion("type", [
    z.object({ type: z.literal("url"), url: z.string().url() }),
    z.object({
      type: z.literal("upload"),
      fileUrl: z.string().url(),
      filename: z.string(),
      size: z.number().int().nonnegative(),
      mediaType: z.string(),
    }),
  ]),
  /** When the extraction completed */
  capturedAt: z.string(),
  /** The structured guidelines manual */
  extracted: ExtractedBrandGuidelinesSchema,
  /** Optional snapshot of CSS tokens for audit (color frequencies, etc.) */
  cssTokens: z.unknown().optional(),
});

export type BrandGuidelines = z.infer<typeof BrandGuidelinesSchema>;

// ─── Form data (mirrors LP configurator) ───────────────────────────────

export const VSL_STATES = ["have_it", "will_record", "no_vsl"] as const;
export type VslState = (typeof VSL_STATES)[number];

export const THEME_STRATEGIES = ["preserve", "refresh", "neutral"] as const;
export type ThemeStrategy = (typeof THEME_STRATEGIES)[number];

export const ProjectFormSchema = z.object({
  business: z.object({
    name: z.string(),
    what: z.string(),
    differentiator: z.string(),
  }),
  /** Selected palette from configurator (preference, not commitment) */
  paletteId: z.string(),
  paletteAvoidId: z.string().nullable(),
  /** Mood tags from form (subset of FORM_EXPOSED_MOODS) */
  moodTags: z.array(z.string()),
  tone: z.object({
    profCasual: z.number(),
    calmBold: z.number(),
    classicModern: z.number(),
  }),
  /** VSL signal — drives hero-video-vsl vs text-hero in the plan. */
  vsl: z
    .object({
      state: z.enum(VSL_STATES).default("no_vsl"),
      /** Optional embed URL when state === "have_it". */
      embedUrl: z.string().url().optional(),
    })
    .default({ state: "no_vsl" }),
  /**
   * preserve = client has brand guidelines and wants them respected;
   * refresh  = client has brand but wants a new look;
   * neutral  = no brand exists, AI proposes from references.
   * Defaults to neutral and is updated when brandGuidelines arrive.
   */
  themeStrategy: z.enum(THEME_STRATEGIES).default("neutral"),
  /** Reference URLs supplied at form time (legacy — purpose lives on Project.references). */
  referenceUrls: z.array(z.string()),
  /** Customer details */
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }),
  /** Add-ons opted in to */
  needCopy: z.boolean(),
  needLogo: z.boolean(),
});

export type ProjectForm = z.infer<typeof ProjectFormSchema>;

// ─── Plan (what the AI proposes / operator approves) ───────────────────

export const PLAN_SECTION_SOURCES = [
  "canon", //  required by the landing-page-builder skill
  "extension_from_refs", //  added because refs consistently showed it
  "operator_added", //  hand-added by the operator
] as const;

export const CONTENT_SOURCES = [
  "brand_guidelines",
  "form",
  "ai_synthesized",
  "operator",
  "intake", //  collected post-payment via /intake/[token]
  "current_site", //  pulled from extracting client's existing site
] as const;

export const PlanSectionSchema = z.object({
  category: z.enum(COMPONENT_CATEGORIES),
  manifestId: z.string(),
  /** Slot key → content. Shape varies per block. Stored as opaque JSON. */
  content: z.record(z.string(), z.unknown()),
  /** Why this section is in the plan. */
  source: z.enum(PLAN_SECTION_SOURCES).default("canon"),
  /** Plain-text reason for placement (audit trail) */
  positionRationale: z.string().optional(),
  /** Per-slot provenance: which input did each filled value come from? */
  contentSources: z.record(z.string(), z.enum(CONTENT_SOURCES)).optional(),
  /** 0-1 confidence score; <0.7 surfaces a review hint to the operator */
  confidence: z.number().min(0).max(1).optional(),
  /** Free-text operator note */
  note: z.string().optional(),
});

export type PlanSection = z.infer<typeof PlanSectionSchema>;

export const PALETTE_SOURCES = [
  "brand_guidelines",
  "ai_proposed",
  "operator",
] as const;

export const FONT_SOURCES = [
  "brand_guidelines_exact", //  exact font available + licensed
  "brand_guidelines_closest", //  closest free/licensed match for the brand font
  "ai_proposed",
  "operator",
] as const;

export const ProjectPlanSchema = z.object({
  sections: z.array(PlanSectionSchema),
  fontPair: z.string(),
  paletteId: z.enum(PALETTE_IDS as [string, ...string[]]),

  /** How the brand identity gets applied. Mirrors form.themeStrategy. */
  themeStrategy: z.enum(THEME_STRATEGIES).default("neutral"),
  /** Where the chosen palette came from. Auditable. */
  paletteSource: z.enum(PALETTE_SOURCES).optional(),
  /** Where the chosen fontPair came from. Auditable. */
  fontSource: z.enum(FONT_SOURCES).optional(),

  /** Optional custom subdomain (default: <project-slug>.vercel.app) */
  customDomain: z.string().optional(),
  /** When the AI first proposed this plan */
  proposedAt: z.string().optional(),
  /** When the operator last edited it */
  editedAt: z.string().optional(),
  /** When the operator approved it (transitions state to audited) */
  approvedAt: z.string().optional(),
});

export type ProjectPlan = z.infer<typeof ProjectPlanSchema>;

// ─── The Project record ────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  state: ProjectStateSchema,
  createdAt: z.string(),
  updatedAt: z.string(),

  // Source
  tier: z.enum(["page", "site", "backoffice"]),
  /** Stripe checkout session ID (set when state moves to paid) */
  paymentRef: z.string().optional(),

  // Form & client uploads
  form: ProjectFormSchema,
  brandGuidelines: BrandGuidelinesSchema.optional(),

  // Auto-collected
  references: z.array(ProjectReferenceSchema),

  // Plan
  plan: ProjectPlanSchema.optional(),

  // Output
  deployedUrl: z.string().url().optional(),
  vercelProjectId: z.string().optional(),
  /** Library version stamped at generation (e.g. git SHA) */
  libraryVersion: z.string().optional(),
  emailSentAt: z.string().optional(),

  // Errors
  failureReason: z.string().optional(),
  failedAt: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────

/** Generate a sortable, URL-safe project ID. */
export function newProjectId(): string {
  const ts = Date.now().toString(36);
  const rand = (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 6)
    : Math.random().toString(36).slice(2, 8));
  return `p_${ts}_${rand}`;
}

/** Check if a state transition is valid. Forward-only except failed → previous. */
export function canTransition(from: ProjectState, to: ProjectState): boolean {
  if (to === "failed") return true; //  any state can fail
  if (from === "failed") return true; //  retry from any failure
  const order = PROJECT_STATES.filter((s) => s !== "failed");
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  // Allow forward and same-state (idempotent updates).
  return toIdx >= fromIdx;
}

/** Default empty form for draft projects (manual creation in /studio). */
export function emptyForm(): ProjectForm {
  return {
    business: { name: "", what: "", differentiator: "" },
    paletteId: "black-cream",
    paletteAvoidId: null,
    moodTags: [],
    tone: { profCasual: 50, calmBold: 50, classicModern: 50 },
    vsl: { state: "no_vsl" },
    themeStrategy: "neutral",
    referenceUrls: [],
    customer: { name: "", email: "" },
    needCopy: false,
    needLogo: false,
  };
}

/** Map LP configurator FormData → ProjectForm. Used by Stripe webhook. */
export function fromConfiguratorForm(
  data: import("@/lib/types").FormData,
  customerEmail?: string
): Partial<ProjectForm> {
  return {
    business: data.business,
    paletteId: data.paletteFavourite || "black-cream",
    paletteAvoidId: data.paletteAvoid,
    // FormData.style is one of the configurator mood IDs — copy as singleton tag
    moodTags: data.style ? [data.style] : [],
    tone: {
      profCasual: data.toneProfCasual,
      calmBold: data.toneCalmBold,
      classicModern: data.toneClassicModern,
    },
    vsl: data.vsl ?? { state: "no_vsl" },
    themeStrategy: data.themeStrategy ?? "neutral",
    referenceUrls: data.references.filter(Boolean),
    customer: {
      name: data.details.name,
      email: data.details.email || customerEmail || "",
      phone: data.details.phone || undefined,
    },
    needCopy: data.needCopy,
    needLogo: data.needLogo,
  };
}
