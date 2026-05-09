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

export const ProjectReferenceSchema = z.object({
  url: z.string().url(),
  status: z.enum(["pending", "extracting", "done", "failed"]),
  jobId: z.string().optional(),
  dna: ReferenceDNASchema.optional(),
  hints: EnrichmentHintsSchema.optional(),
  error: z.string().optional(),
});

export type ProjectReference = z.infer<typeof ProjectReferenceSchema>;

// ─── Brand guidelines (uploaded by client, AI-parsed) ──────────────────

export const BrandGuidelinesSchema = z.object({
  /** Public Vercel Blob URL of the uploaded file */
  fileUrl: z.string().url(),
  /** Original filename */
  filename: z.string(),
  /** Bytes */
  size: z.number().int().nonnegative(),
  /** MIME */
  mediaType: z.string(),
  /** Set after AI parsing */
  parsed: z
    .object({
      summary: z.string(),
      colors: z.array(z.string()),
      fonts: z.array(z.string()),
      tone: z.string().optional(),
    })
    .optional(),
});

export type BrandGuidelines = z.infer<typeof BrandGuidelinesSchema>;

// ─── Form data (mirrors LP configurator) ───────────────────────────────

export const ProjectFormSchema = z.object({
  business: z.object({
    name: z.string(),
    what: z.string(),
    differentiator: z.string(),
  }),
  /** Selected palette from configurator */
  paletteId: z.string(),
  paletteAvoidId: z.string().nullable(),
  /** Mood tags from form (subset of FORM_EXPOSED_MOODS) */
  moodTags: z.array(z.string()),
  tone: z.object({
    profCasual: z.number(),
    calmBold: z.number(),
    classicModern: z.number(),
  }),
  sections: z.array(z.string()),
  /** Reference URLs supplied at form time */
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

export const PlanSectionSchema = z.object({
  category: z.enum(COMPONENT_CATEGORIES),
  manifestId: z.string(),
  /** Slot key → content. Shape varies per block. Stored as opaque JSON. */
  content: z.record(z.string(), z.unknown()),
  /** Operator notes for this section */
  note: z.string().optional(),
});

export type PlanSection = z.infer<typeof PlanSectionSchema>;

export const ProjectPlanSchema = z.object({
  sections: z.array(PlanSectionSchema),
  fontPair: z.string(),
  paletteId: z.enum(PALETTE_IDS as [string, ...string[]]),
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
    sections: ["hero", "services", "testimonials", "footer"],
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
    sections: data.sections,
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
