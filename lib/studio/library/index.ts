/**
 * Component library — Lote 1 (10 blocks).
 *
 * Each manifest hand-tags a real React component under
 * `components/library/<category>/<Name>.tsx` with DesignDNA so the
 * matcher can rank them against form inputs + reference URLs.
 *
 * The components themselves are token-driven (read from CSS vars
 * defined in `app/library.css`). Default rendering is generic
 * dark-mode + Inter; the matcher swaps tokens per project via
 * <LibraryRoot palette={...} fontPair={...}>. Adapting to a new
 * brand = changing tokens, not editing block code.
 *
 * The DesignDNA tagged below describes the block's design INTENT
 * (e.g. "this is meant to feel bold and grotesque"), not the literal
 * fonts loaded in the demo. The matcher uses intent for ranking.
 */

import { ComponentManifest } from "../types";

export const LIBRARY: ComponentManifest[] = [
  // ─────────────────────────────────────────────────────────────────────
  // HEROES
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "hero-centered-display",
    name: "Hero — Centered Display",
    category: "hero",
    moodTags: ["minimalista", "editorial", "luxurious", "clean"],
    tone: { profCasual: 30, calmBold: 40, classicModern: 60 },
    typography: {
      primary: "serif-display",
      pairing: "display-body-pair",
      feel: "elegant",
      expressiveness: 4,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA", "#8B8B8B"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/heroes/HeroCenteredDisplay.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "warm-sand", "royal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label sobre o título", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline principal", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "primaryCtaLabel", label: "CTA principal", type: "text-short", required: true, maxChars: 24 },
      { key: "primaryCtaHref", label: "CTA principal — destino", type: "url", required: false },
      { key: "secondaryCtaLabel", label: "CTA secundário", type: "text-short", required: false, maxChars: 24 },
      { key: "secondaryCtaHref", label: "CTA secundário — destino", type: "url", required: false },
    ],
  },
  {
    id: "hero-split-image-text",
    name: "Hero — Split Image + Text",
    category: "hero",
    moodTags: ["caloroso", "suave", "editorial", "organic"],
    tone: { profCasual: 45, calmBold: 35, classicModern: 50 },
    typography: {
      primary: "serif-modern",
      pairing: "serif-sans-pair",
      feel: "humanist",
      expressiveness: 3,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "asymmetric",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "calm",
    filePath: "components/library/heroes/HeroSplitImageText.tsx",
    exportName: "default",
    compatiblePalettes: ["warm-sand", "forest", "black-cream", "coastal", "sunset"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "imageUrl", label: "Imagem hero", type: "image", required: true },
      { key: "imageAlt", label: "Alt da imagem", type: "text-short", required: false, maxChars: 120 },
      { key: "primaryCtaLabel", label: "CTA principal", type: "text-short", required: true, maxChars: 24 },
      { key: "primaryCtaHref", label: "CTA principal — destino", type: "url", required: false },
      { key: "secondaryCtaLabel", label: "CTA secundário", type: "text-short", required: false, maxChars: 24 },
      { key: "secondaryCtaHref", label: "CTA secundário — destino", type: "url", required: false },
    ],
  },
  {
    id: "hero-bold-statement",
    name: "Hero — Bold Statement",
    category: "hero",
    moodTags: ["bold", "brutalist", "editorial", "futuristic"],
    tone: { profCasual: 50, calmBold: 80, classicModern: 70 },
    typography: {
      primary: "sans-grotesque",
      pairing: "single",
      feel: "industrial",
      expressiveness: 5,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "tight",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/heroes/HeroBoldStatement.tsx",
    exportName: "default",
    compatiblePalettes: ["mono-plus", "black-cream", "bold-red", "royal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "statement", label: "Frase manifesto", type: "text-short", required: true, maxChars: 120 },
      { key: "accentWord", label: "Palavra com ênfase (italic)", type: "text-short", required: false, maxChars: 30 },
      { key: "byline", label: "Byline / explicação", type: "text-short", required: false, maxChars: 200 },
      { key: "primaryCtaLabel", label: "CTA", type: "text-short", required: false, maxChars: 24 },
      { key: "primaryCtaHref", label: "CTA — destino", type: "url", required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // HERO — VSL variant
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "hero-video-vsl",
    name: "Hero — VSL Video",
    category: "hero",
    moodTags: ["bold", "editorial", "luxurious", "tech"],
    tone: { profCasual: 35, calmBold: 60, classicModern: 65 },
    typography: {
      primary: "sans-grotesque",
      pairing: "single",
      feel: "industrial",
      expressiveness: 4,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "centered",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "snappy",
    filePath: "components/library/heroes/HeroVideoVsl.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "coastal", "warm-sand"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline (1 linha)", type: "text-short", required: false, maxChars: 160 },
      { key: "vslEmbedUrl", label: "VSL embed URL (YouTube/Vimeo/Wistia)", type: "url", required: true },
      { key: "vslPosterUrl", label: "Thumbnail/poster URL", type: "url", required: false },
      { key: "primaryCtaLabel", label: "CTA principal", type: "text-short", required: true, maxChars: 24 },
      { key: "primaryCtaHref", label: "CTA principal — destino", type: "url", required: false },
      { key: "secondaryCtaLabel", label: "CTA secundário", type: "text-short", required: false, maxChars: 24 },
      { key: "secondaryCtaHref", label: "CTA secundário — destino", type: "url", required: false },
      { key: "refundLine", label: "Linha da garantia/refund", type: "text-short", required: false, maxChars: 120 },
      { key: "stats", label: "Stats strip (até 3, value + label)", type: "list", required: false },
    ],
    notes: "Use this when the project's vsl.state === 'have_it'. Falls back to hero-centered-display otherwise.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // PROBLEM (canon)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "problem-list-agitation",
    name: "Problem — Stacked Agitation Lines",
    category: "problem",
    moodTags: ["editorial", "bold", "minimalista"],
    tone: { profCasual: 35, calmBold: 60, classicModern: 55 },
    typography: {
      primary: "sans-grotesque",
      pairing: "single",
      feel: "industrial",
      expressiveness: 4,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "calm",
    filePath: "components/library/problem/ProblemListAgitation.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "warm-sand", "bold-red"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "painLines", label: "3-5 pain lines (uma por entry)", type: "list", required: true },
      { key: "resolutionLine", label: "Linha de resolução (italic)", type: "text-short", required: false, maxChars: 120 },
      { key: "resolutionAccent", label: "Palavras com accent color na resolution", type: "text-short", required: false, maxChars: 30 },
    ],
    notes: "Canon section #2 (Problem). Pain points stacked + optional resolution line.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // SERVICES
  // ─────────────────────────────────────────────────────────────────────
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
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
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
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline da secção", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "services", label: "3 serviços (label + título + descrição)", type: "list", required: true },
    ],
  },
  {
    id: "services-accordion",
    name: "Services — Vertical Accordion",
    category: "services",
    moodTags: ["editorial", "suave", "minimalista"],
    tone: { profCasual: 35, calmBold: 30, classicModern: 50 },
    typography: {
      primary: "serif-modern",
      pairing: "serif-sans-pair",
      feel: "elegant",
      expressiveness: 3,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "calm",
    filePath: "components/library/services/ServicesAccordion.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "forest", "royal", "mono-plus"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "items", label: "Lista de serviços (título + descrição)", type: "list", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // BENEFITS (canon)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "benefits-grid-icons",
    name: "Benefits — Icon Grid",
    category: "benefits",
    moodTags: ["clean", "minimalista", "editorial"],
    tone: { profCasual: 40, calmBold: 45, classicModern: 60 },
    typography: {
      primary: "sans-geometric",
      pairing: "single",
      feel: "neutral",
      expressiveness: 2,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/benefits/BenefitsGridIcons.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "coastal", "royal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "benefits", label: "2-6 benefits (icon, title, body)", type: "list", required: true },
    ],
    notes: "Canon section #4 (Benefits). Icons: clock, tag, spark, shield, zap, check.",
  },

  // ─────────────────────────────────────────────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "testimonials-rotating-quote",
    name: "Testimonials — Rotating Quote",
    category: "testimonials",
    moodTags: ["editorial", "luxurious", "suave"],
    tone: { profCasual: 30, calmBold: 30, classicModern: 50 },
    typography: {
      primary: "serif-modern",
      pairing: "serif-sans-pair",
      feel: "elegant",
      expressiveness: 4,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "calm",
    filePath: "components/library/testimonials/TestimonialsRotatingQuote.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "mono-plus", "royal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "testimonials", label: "Lista de testemunhos (frase + autor + cargo)", type: "list", required: true },
      { key: "intervalMs", label: "Intervalo de rotação (ms, 0 desativa)", type: "stat", required: false },
    ],
  },
  {
    id: "testimonials-marquee",
    name: "Testimonials — Horizontal Marquee",
    category: "testimonials",
    moodTags: ["clean", "tech", "futuristic", "minimalista"],
    tone: { profCasual: 50, calmBold: 50, classicModern: 70 },
    typography: {
      primary: "sans-geometric",
      pairing: "single",
      feel: "neutral",
      expressiveness: 2,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "calm",
    filePath: "components/library/testimonials/TestimonialsMarquee.tsx",
    exportName: "default",
    compatiblePalettes: ["mono-plus", "black-cream", "coastal", "royal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline (opcional)", type: "text-short", required: false, maxChars: 90 },
      { key: "testimonials", label: "Lista de quotes (frase + autor + cargo)", type: "list", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // ABOUT
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "about-portrait-bio",
    name: "About — Portrait + Bio",
    category: "about",
    moodTags: ["caloroso", "suave", "editorial", "organic"],
    tone: { profCasual: 50, calmBold: 30, classicModern: 45 },
    typography: {
      primary: "serif-modern",
      pairing: "serif-sans-pair",
      feel: "humanist",
      expressiveness: 3,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "asymmetric",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "calm",
    filePath: "components/library/about/AboutPortraitBio.tsx",
    exportName: "default",
    compatiblePalettes: ["warm-sand", "forest", "black-cream", "sunset", "coastal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "name", label: "Nome", type: "text-short", required: true, maxChars: 80 },
      { key: "role", label: "Cargo / função", type: "text-short", required: true, maxChars: 80 },
      { key: "bio", label: "Bio (1-2 parágrafos)", type: "text-long", required: true, maxChars: 800 },
      { key: "portraitUrl", label: "Foto", type: "image", required: true },
      { key: "portraitAlt", label: "Alt da foto", type: "text-short", required: false },
      { key: "stats", label: "Stats (até 3, valor + label)", type: "list", required: false },
      { key: "ctaLabel", label: "CTA texto", type: "text-short", required: false, maxChars: 30 },
      { key: "ctaHref", label: "CTA destino", type: "url", required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CONTACT
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "contact-form-split",
    name: "Contact — Form + Image Split",
    category: "contact",
    moodTags: ["clean", "minimalista", "editorial"],
    tone: { profCasual: 40, calmBold: 35, classicModern: 55 },
    typography: {
      primary: "sans-geometric",
      pairing: "single",
      feel: "neutral",
      expressiveness: 2,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "asymmetric",
    imagery: { style: "photographic", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/contact/ContactFormSplit.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "coastal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "imageUrl", label: "Imagem (mapa, foto do espaço, etc.)", type: "image", required: false },
      { key: "imageAlt", label: "Alt", type: "text-short", required: false },
      { key: "contactLines", label: "Linhas de contacto (label + valor + href)", type: "list", required: false },
      { key: "submitLabel", label: "Texto do botão", type: "text-short", required: false, maxChars: 30 },
      { key: "action", label: "URL para POST do formulário", type: "url", required: false },
      { key: "successMessage", label: "Mensagem após envio", type: "text-short", required: false, maxChars: 140 },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // PRICING (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "pricing-3tier-comparison",
    name: "Pricing — 3-Tier Comparison",
    category: "pricing",
    moodTags: ["clean", "editorial", "tech", "minimalista"],
    tone: { profCasual: 35, calmBold: 50, classicModern: 60 },
    typography: { primary: "sans-geometric", pairing: "single", feel: "neutral", expressiveness: 2 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/pricing/Pricing3TierComparison.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "coastal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "tiers", label: "3 tiers (nome, preço, features, CTA, highlighted)", type: "list", required: true },
      { key: "footnote", label: "Footnote (ex: garantia)", type: "text-short", required: false, maxChars: 120 },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // STATS (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "stats-metrics-row",
    name: "Stats — Metrics Row",
    category: "stats",
    moodTags: ["bold", "clean", "editorial", "tech"],
    tone: { profCasual: 40, calmBold: 65, classicModern: 65 },
    typography: { primary: "sans-grotesque", pairing: "single", feel: "industrial", expressiveness: 4 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/stats/StatsMetricsRow.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "bold-red", "royal", "coastal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline (opcional)", type: "text-short", required: false, maxChars: 90 },
      { key: "stats", label: "Lista de stats (value + label + bar opcional 0-100)", type: "list", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // LOGOS (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "logos-press-strip",
    name: "Logos — Press / Clients Strip",
    category: "logos",
    moodTags: ["minimalista", "clean", "editorial"],
    tone: { profCasual: 35, calmBold: 25, classicModern: 55 },
    typography: { primary: "sans-geometric", pairing: "single", feel: "neutral", expressiveness: 1 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA", "#8B8B8B"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "centered",
    imagery: { style: "abstract", treatment: "raw", showsPeople: false },
    motion: "calm",
    filePath: "components/library/logos/LogosPressStrip.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "warm-sand", "coastal", "forest", "royal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline (ex: 'As featured in')", type: "text-short", required: false, maxChars: 80 },
      { key: "logos", label: "Lista de logos (name + imageUrl opcional + href)", type: "list", required: true },
      { key: "variant", label: "Layout: 'grid' ou 'marquee'", type: "text-short", required: false, maxChars: 10 },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // BLOG (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "articles-grid-3col",
    name: "Articles — 3-Column Grid",
    category: "blog",
    moodTags: ["editorial", "clean", "suave"],
    tone: { profCasual: 40, calmBold: 30, classicModern: 50 },
    typography: { primary: "serif-modern", pairing: "serif-sans-pair", feel: "elegant", expressiveness: 3 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "left",
    imagery: { style: "photographic", treatment: "graded", showsPeople: false },
    motion: "calm",
    filePath: "components/library/blog/ArticlesGrid3Col.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "forest", "royal", "mono-plus", "coastal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "articles", label: "Lista de artigos (título, excerpt, imagem, categoria, data, href, readTime)", type: "list", required: true },
      { key: "viewAllLabel", label: "Texto do CTA 'Ver todos'", type: "text-short", required: false, maxChars: 30 },
      { key: "viewAllHref", label: "Destino do CTA 'Ver todos'", type: "url", required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // SERVICES — variant (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "services-numbered-expanded",
    name: "Services — Numbered + Expanded Detail",
    category: "services",
    moodTags: ["editorial", "bold", "luxurious"],
    tone: { profCasual: 30, calmBold: 50, classicModern: 55 },
    typography: { primary: "serif-modern", pairing: "serif-sans-pair", feel: "elegant", expressiveness: 4 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/services/ServicesNumberedExpanded.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "forest", "royal", "mono-plus"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "services", label: "Serviços (título, descrição, capabilities[], resources[])", type: "list", required: true },
      { key: "defaultOpen", label: "Índice da row aberta por defeito", type: "stat", required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // CTA (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "cta-banner-closing",
    name: "CTA — Closing Banner",
    category: "cta",
    moodTags: ["bold", "minimalista", "editorial"],
    tone: { profCasual: 40, calmBold: 65, classicModern: 65 },
    typography: { primary: "sans-grotesque", pairing: "single", feel: "industrial", expressiveness: 4 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/cta/CtaBannerClosing.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "bold-red", "royal", "coastal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline manifesto", type: "text-short", required: true, maxChars: 110 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 200 },
      { key: "primaryCtaLabel", label: "CTA principal", type: "text-short", required: true, maxChars: 24 },
      { key: "primaryCtaHref", label: "CTA principal — destino", type: "url", required: false },
      { key: "secondaryCtaLabel", label: "CTA secundário", type: "text-short", required: false, maxChars: 24 },
      { key: "secondaryCtaHref", label: "CTA secundário — destino", type: "url", required: false },
      { key: "variant", label: "'centered' ou 'island'", type: "text-short", required: false, maxChars: 10 },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // GALLERY (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "gallery-image-grid",
    name: "Gallery — Mixed-Size Image Grid",
    category: "gallery",
    moodTags: ["caloroso", "editorial", "organic", "luxurious"],
    tone: { profCasual: 50, calmBold: 35, classicModern: 50 },
    typography: { primary: "serif-modern", pairing: "serif-sans-pair", feel: "humanist", expressiveness: 3 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "left",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "calm",
    filePath: "components/library/gallery/GalleryImageGrid.tsx",
    exportName: "default",
    compatiblePalettes: ["warm-sand", "forest", "black-cream", "coastal", "sunset", "royal"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline (opcional)", type: "text-short", required: false, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "items", label: "Imagens (imageUrl, title, category, href, shape: tall/wide/square)", type: "list", required: true },
      { key: "viewAllLabel", label: "CTA 'Ver tudo'", type: "text-short", required: false, maxChars: 30 },
      { key: "viewAllHref", label: "CTA destino", type: "url", required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "process-vertical-timeline",
    name: "Process — Vertical Timeline",
    category: "process",
    moodTags: ["clean", "tech", "editorial", "minimalista"],
    tone: { profCasual: 35, calmBold: 45, classicModern: 60 },
    typography: { primary: "sans-geometric", pairing: "single", feel: "neutral", expressiveness: 2 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "snappy",
    filePath: "components/library/process/ProcessVerticalTimeline.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "coastal", "royal", "forest"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "headline", label: "Headline", type: "text-short", required: true, maxChars: 90 },
      { key: "subheadline", label: "Sub-headline", type: "text-short", required: false, maxChars: 180 },
      { key: "steps", label: "Passos (title, description, meta opcional)", type: "list", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // TESTIMONIALS — variant (Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "testimonials-single-navigated",
    name: "Testimonials — Single Quote + Arrows",
    category: "testimonials",
    moodTags: ["editorial", "luxurious", "suave"],
    tone: { profCasual: 25, calmBold: 35, classicModern: 50 },
    typography: { primary: "serif-display", pairing: "display-body-pair", feel: "elegant", expressiveness: 4 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "airy",
    alignment: "centered",
    imagery: { style: "photographic", treatment: "graded", showsPeople: true },
    motion: "snappy",
    filePath: "components/library/testimonials/TestimonialsSingleNavigated.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "warm-sand", "mono-plus", "royal", "forest", "sunset"],
    slots: [
      { key: "eyebrow", label: "Label", type: "text-short", required: false, maxChars: 40 },
      { key: "testimonials", label: "Testemunhos (quote, author, role, company, avatarUrl, logoUrl)", type: "list", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // FOOTER (Lote 1 + variant Lote 2)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: "footer-minimal-3col",
    name: "Footer — Minimal 3-Column",
    category: "footer",
    moodTags: ["minimalista", "clean", "editorial"],
    tone: { profCasual: 40, calmBold: 30, classicModern: 55 },
    typography: {
      primary: "sans-geometric",
      pairing: "single",
      feel: "neutral",
      expressiveness: 1,
    },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#131313", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "comfortable",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "static",
    filePath: "components/library/footer/FooterMinimal3Col.tsx",
    exportName: "default",
    compatiblePalettes: ["black-cream", "mono-plus", "royal", "forest", "coastal", "warm-sand"],
    slots: [
      { key: "brandName", label: "Nome da marca", type: "text-short", required: true, maxChars: 60 },
      { key: "tagline", label: "Tagline", type: "text-short", required: false, maxChars: 140 },
      { key: "columns", label: "Colunas de links (título + lista de {label, href})", type: "list", required: true },
      { key: "socialLinks", label: "Redes sociais", type: "list", required: false },
      { key: "copyright", label: "Linha de copyright", type: "text-short", required: false, maxChars: 100 },
      { key: "legalLinks", label: "Links legais", type: "list", required: false },
    ],
  },
  {
    id: "footer-wordmark-bold",
    name: "Footer — Massive Wordmark",
    category: "footer",
    moodTags: ["bold", "brutalist", "editorial", "minimalista"],
    tone: { profCasual: 35, calmBold: 75, classicModern: 65 },
    typography: { primary: "sans-grotesque", pairing: "single", feel: "industrial", expressiveness: 5 },
    palette: {
      closestId: null,
      dominantHex: ["#0A0A0A", "#FAFAFA"],
      background: "#0A0A0A",
      isDarkMode: true,
    },
    density: "tight",
    alignment: "left",
    imagery: { style: "minimal-none", treatment: "raw", showsPeople: false },
    motion: "static",
    filePath: "components/library/footer/FooterWordmarkBold.tsx",
    exportName: "default",
    compatiblePalettes: ["mono-plus", "black-cream", "bold-red", "royal"],
    slots: [
      { key: "brandName", label: "Nome da marca (wordmark gigante)", type: "text-short", required: true, maxChars: 30 },
      { key: "tagline", label: "Tagline", type: "text-short", required: false, maxChars: 200 },
      { key: "columns", label: "Colunas de links", type: "list", required: true },
      { key: "socialLinks", label: "Redes sociais", type: "list", required: false },
      { key: "copyright", label: "Linha de copyright", type: "text-short", required: false, maxChars: 100 },
      { key: "legalLinks", label: "Links legais", type: "list", required: false },
    ],
    notes: "Wordmark full-bleed na base puxa o olho para o logo. Best com nome curto (≤12 chars).",
  },
];

/** Filter the library by category — used by the matcher. */
export function libraryByCategory(category: string): ComponentManifest[] {
  return LIBRARY.filter((c) => c.category === category);
}
