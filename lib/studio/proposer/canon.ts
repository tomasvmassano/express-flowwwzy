/**
 * The landing-page-builder skill canon — non-negotiable structure for
 * every generated LP. The proposer always emits these in order; client
 * doesn't get to pick.
 *
 * Hero variant flips on project.form.vsl.state:
 *   "have_it" → hero-video-vsl
 *   else      → text-hero (hero-bold-statement / hero-centered-display
 *                          chosen by matcher based on brand mood)
 */

import type { ComponentCategory } from "../vocabulary";

export type CanonSlot = {
  /** Order in the page */
  order: number;
  category: ComponentCategory;
  /** Human-readable rationale stored on the PlanSection for audit */
  rationale: string;
  /** Whether the proposer must emit this section (true = mandatory). */
  required: boolean;
};

export const CANON: CanonSlot[] = [
  { order: 1, category: "hero", rationale: "Canon §1 — hook + primary CTA above fold", required: true },
  { order: 2, category: "problem", rationale: "Canon §2 — articulate the pain client's audience faces", required: true },
  { order: 3, category: "services", rationale: "Canon §3 — solution / mechanism (services or process)", required: true },
  { order: 4, category: "benefits", rationale: "Canon §4 — outcome-focused benefits", required: true },
  { order: 5, category: "testimonials", rationale: "Canon §5 — social proof", required: true },
  { order: 6, category: "faq", rationale: "Canon §6 — objection handling", required: true },
  { order: 7, category: "pricing", rationale: "Canon §7 — offer / pricing tiers", required: true },
  { order: 8, category: "cta", rationale: "Canon §8 — final closing CTA", required: true },
  { order: 9, category: "footer", rationale: "Canon §9 — footer", required: true },
];

/** Categories the canon expects. Used by validators. */
export const CANON_CATEGORIES = CANON.map((c) => c.category);

/**
 * For each CanonSlot, pick the right manifestId taking VSL signal,
 * brand mood and ref purpose into account. Falls back to first
 * matching block in the library if heuristic doesn't fire.
 */
export function pickHeroManifestId(vslState: "have_it" | "will_record" | "no_vsl", moodTags: string[]): string {
  if (vslState === "have_it") return "hero-video-vsl";
  // Bold mood → bold-statement. Otherwise centered-display by default.
  if (moodTags.includes("bold") || moodTags.includes("brutalist") || moodTags.includes("editorial")) {
    return "hero-bold-statement";
  }
  return "hero-centered-display";
}
