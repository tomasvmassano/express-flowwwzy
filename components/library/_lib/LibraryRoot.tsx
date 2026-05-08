/**
 * Wraps any library block(s) and applies a token theme.
 *
 * Usage from the demo page or the generator:
 *
 *   <LibraryRoot palette="warm-sand" mode="dark" fontPair="serif-sans">
 *     <HeroSplitImageText {...slots} />
 *   </LibraryRoot>
 *
 * Blocks themselves never need to know which palette is active. They
 * read tokens via Tailwind aliases (bg-lib-bg, text-lib-foreground,
 * font-lib-display, etc.). Switching palette = swapping data-theme.
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
  | "default" //  Inter / Inter
  | "sans-pair" //  Geist / Inter
  | "serif-sans" //  Fraunces / Inter
  | "display-body"; //  PP Editorial / Söhne

const FONT_PAIRS: Record<FontPair, { display: string; body: string }> = {
  default: {
    display: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  "sans-pair": {
    display: "'Geist', Inter, system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
  },
  "serif-sans": {
    display: "'Fraunces', 'Times New Roman', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  "display-body": {
    display: "'PP Editorial New', 'Times New Roman', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
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
  fontPair = "default",
  className = "",
  style,
}: Props) {
  const fonts = FONT_PAIRS[fontPair];
  const cssVars: CSSProperties = {
    ["--lib-font-display" as any]: fonts.display,
    ["--lib-font-body" as any]: fonts.body,
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
