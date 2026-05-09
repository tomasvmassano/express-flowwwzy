/**
 * Wraps any library block(s) and applies a token theme.
 *
 * Usage from the demo page or the generator:
 *
 *   <LibraryRoot palette="warm-sand" mode="dark" fontPair="fraunces-inter">
 *     <HeroSplitImageText {...slots} />
 *   </LibraryRoot>
 *
 * Blocks themselves never need to know which palette is active. They
 * read tokens via Tailwind aliases (bg-lib-bg, text-lib-foreground,
 * font-lib-display, etc.). Switching palette = swapping data-theme.
 *
 * FONT PAIRS — 12 curated stacks spanning the typography classification
 * space. Free pairs (Inter, Geist, Fraunces, etc.) load in the demo
 * via Google Fonts. Premium pairs (Söhne, Founders Grotesk, PP Editorial,
 * GT America) declare the family at the head of the stack but the demo
 * falls back to a free family if the host doesn't license the font.
 * The generator can swap to the licensed file when a project is paid for.
 */

import { ReactNode, CSSProperties } from "react";

export type PaletteId =
  | "default"
  | "black-cream"
  | "forest"
  | "coastal"
  | "warm-sand"
  | "bold-red"
  | "royal"
  | "mono-plus"
  | "sunset";

export type Mode = "dark" | "light";

export type FontPair =
  // ── Free / Google Fonts (demo loads these) ──
  | "inter" //         neutral default
  | "geist-inter" //   modern geometric sans + neutral body
  | "fraunces-inter" //warm display serif + neutral sans
  | "instrument-jakarta" // editorial serif + friendly geometric
  | "space-inter" //   industrial grotesque + neutral
  | "cormorant-jakarta" // classical serif + geometric
  | "manrope" //       friendly humanist (single)
  | "newsreader-inter" // editorial humanist serif + neutral
  | "mono-inter" //    developer aesthetic
  // ── Premium (license needed; demo falls back to free) ──
  | "sohne-tiempos" // Söhne / Tiempos (Stripe / NYTimes pair)
  | "founders-tight" // Founders Grotesk / Inter Tight (Bottega-style)
  | "editorial-inter" // PP Editorial New / Inter (display serif moment)
  // ── Backwards compat ──
  | "default"
  | "sans-pair"
  | "serif-sans"
  | "display-body";

const SANS_FALLBACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SERIF_FALLBACK = "Georgia, 'Times New Roman', serif";
const MONO_FALLBACK = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const FONT_PAIRS: Record<FontPair, { display: string; body: string }> = {
  // ── Free pairs ──
  inter: {
    display: `'Inter', ${SANS_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "geist-inter": {
    display: `'Geist', 'Inter', ${SANS_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "fraunces-inter": {
    display: `'Fraunces', ${SERIF_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "instrument-jakarta": {
    display: `'Instrument Serif', ${SERIF_FALLBACK}`,
    body: `'Plus Jakarta Sans', ${SANS_FALLBACK}`,
  },
  "space-inter": {
    display: `'Space Grotesk', ${SANS_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "cormorant-jakarta": {
    display: `'Cormorant Garamond', ${SERIF_FALLBACK}`,
    body: `'Plus Jakarta Sans', ${SANS_FALLBACK}`,
  },
  manrope: {
    display: `'Manrope', ${SANS_FALLBACK}`,
    body: `'Manrope', ${SANS_FALLBACK}`,
  },
  "newsreader-inter": {
    display: `'Newsreader', ${SERIF_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "mono-inter": {
    display: `'JetBrains Mono', ${MONO_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },

  // ── Premium pairs (declared with curated free fallbacks) ──
  "sohne-tiempos": {
    display: `'Söhne', 'Inter Tight', 'Inter', ${SANS_FALLBACK}`,
    body: `'Tiempos', 'Newsreader', ${SERIF_FALLBACK}`,
  },
  "founders-tight": {
    display: `'Founders Grotesk', 'Space Grotesk', ${SANS_FALLBACK}`,
    body: `'Inter Tight', 'Inter', ${SANS_FALLBACK}`,
  },
  "editorial-inter": {
    display: `'PP Editorial New', 'Fraunces', ${SERIF_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },

  // ── Backwards compat aliases ──
  default: {
    display: `'Inter', ${SANS_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "sans-pair": {
    display: `'Geist', 'Inter', ${SANS_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "serif-sans": {
    display: `'Fraunces', ${SERIF_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
  "display-body": {
    display: `'PP Editorial New', 'Fraunces', ${SERIF_FALLBACK}`,
    body: `'Inter', ${SANS_FALLBACK}`,
  },
};

/**
 * Map from typography classification (matcher output) → reasonable FontPair
 * default. The generator uses this to pick a sensible starting font when no
 * pair has been explicitly selected. Operator can override per-project.
 */
export const TYPE_CLASS_TO_FONT_PAIR: Record<string, FontPair> = {
  "sans-neutral": "inter",
  "sans-humanist": "manrope",
  "sans-geometric": "geist-inter",
  "sans-grotesque": "space-inter",
  "serif-classic": "cormorant-jakarta",
  "serif-modern": "newsreader-inter",
  "serif-display": "fraunces-inter",
  "serif-slab": "newsreader-inter",
  mono: "mono-inter",
  script: "instrument-jakarta",
};

type Props = {
  children: ReactNode;
  palette?: PaletteId;
  mode?: Mode;
  fontPair?: FontPair;
  className?: string;
  /** Optional inline style override for one-off tweaks */
  style?: CSSProperties;
};

export default function LibraryRoot({
  children,
  palette = "default",
  mode = "dark",
  fontPair = "inter",
  className = "",
  style,
}: Props) {
  const fonts = FONT_PAIRS[fontPair];
  const cssVars: CSSProperties = {
    ["--lib-font-display" as unknown as string]: fonts.display,
    ["--lib-font-body" as unknown as string]: fonts.body,
  };

  return (
    <div
      className={`lib-theme ${className}`}
      data-theme={palette === "default" ? undefined : palette}
      data-mode={mode}
      style={{ ...cssVars, ...style }}
    >
      {children}
    </div>
  );
}
