export type Tier = "page" | "site" | "backoffice";

export const TIERS: Record<Tier, { id: Tier; name: string; price: number; delivery: string; description: string }> = {
  page: { id: "page", name: "Express Page", price: 490, delivery: "48-72h", description: "Landing page única, alta conversão" },
  site: { id: "site", name: "Express Site", price: 890, delivery: "5 dias", description: "Site completo até 5 páginas" },
  backoffice: { id: "backoffice", name: "Express Backoffice", price: 1490, delivery: "10 dias", description: "Site + ferramenta interna à medida" },
};

export type Style =
  | "minimalista"
  | "bold"
  | "suave"
  | "tech"
  | "caloroso"
  | "clean";

export type ReferencePurpose = "aspirational" | "current_site" | "competitor";
export type ReferenceItem = { url: string; purpose: ReferencePurpose };
export type VslSignal = { state: "have_it" | "will_record" | "no_vsl"; embedUrl?: string };
export type ThemeStrategy = "preserve" | "refresh" | "neutral";

export type FormData = {
  tier: Tier | null;
  style: Style | null;
  paletteFavourite: string | null;
  paletteAvoid: string | null;
  toneProfCasual: number;
  toneCalmBold: number;
  toneClassicModern: number;
  business: { name: string; what: string; differentiator: string };
  /** Legacy flat URL list — kept for back-compat. Defaults to "aspirational" purpose. */
  references: string[];
  /** Per-URL purpose tagging (replaces references[] for new flows). */
  referenceItems?: ReferenceItem[];
  /** VSL signal — drives hero variant in the plan (text-hero vs hero-video-vsl). */
  vsl: VslSignal;
  /** Theme strategy. Defaults neutral; flips to preserve when brand guidelines extracted. */
  themeStrategy: ThemeStrategy;
  /** REMOVED: client no longer picks sections. Canon (landing-page-builder skill) is enforced. */
  // sections: string[];
  details: { name: string; email: string; phone: string };
  needCopy: boolean;
  needLogo: boolean;
  step: number;
};

export const initialForm: FormData = {
  tier: null,
  style: null,
  paletteFavourite: null,
  paletteAvoid: null,
  toneProfCasual: 50,
  toneCalmBold: 50,
  toneClassicModern: 50,
  business: { name: "", what: "", differentiator: "" },
  references: ["", "", ""],
  referenceItems: undefined,
  vsl: { state: "no_vsl" },
  themeStrategy: "neutral",
  details: { name: "", email: "", phone: "" },
  needCopy: false,
  needLogo: false,
  step: 1,
};
