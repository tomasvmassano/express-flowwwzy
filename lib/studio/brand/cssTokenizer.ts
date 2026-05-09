/**
 * CSS deep tokenizer — extracts concrete design tokens from the CSS
 * a website serves. Feeds the brand-guidelines vision call as side
 * context so the model gets exact values for things it would otherwise
 * have to guess from rendered glyphs and pixels.
 *
 * Pipeline (called from the brand extractor orchestrator):
 *   url → fetch HTML → list <link rel="stylesheet"> hrefs
 *       → fetch first 8 stylesheets (capped, parallel, timed-out)
 *       → run extractCssTokens on each
 *       → merge + sort by frequency
 *
 * What we extract:
 *   - colorFrequencies   : { "#1a1a1a": 47, "#faebe3": 12, ... }
 *   - fontFamilies       : ["Satoshi", "STIX Two Text", "Inter"]
 *   - cssVariables       : { "--white": "#ECECEC", "--gray-500": "#757575" }
 *   - mediaBreakpoints   : ["(max-width: 479px)", "(min-width: 992px)"]
 *   - fontSizeValues     : ["6.6rem", "3.875rem", "1.5rem", "16px"]
 *   - radiusValues       : ["0.5rem", "12px", "20px", "50%"]
 *   - spacingValues      : ["8px", "24px", "64px", "70px"]
 *   - easingValues       : ["cubic-bezier(.165, .84, .44, 1)", "linear"]
 *
 * No HTML parsing here — pure regex against CSS source. Robustness is
 * worth more than completeness: malformed CSS shouldn't crash the run.
 */

const USER_AGENT =
  "Mozilla/5.0 (compatible; FlowwwzyStudio/1.0; +https://flowwwzy.com/studio)";

const MAX_STYLESHEETS = 8;
const STYLESHEET_TIMEOUT_MS = 5000;
const STYLESHEET_MAX_BYTES = 512 * 1024; //  512KB per file

export type CssTokens = {
  colorFrequencies: Record<string, number>; //  hex → count
  fontFamilies: string[];
  cssVariables: Record<string, string>;
  mediaBreakpoints: string[];
  fontSizeValues: string[];
  radiusValues: string[];
  spacingValues: string[];
  easingValues: string[];
  /** How many stylesheets we successfully fetched + parsed */
  stylesheetsRead: number;
  /** URLs that 404ed or timed out — useful for diagnostics */
  stylesheetsFailed: string[];
};

export async function extractCssTokens(htmlUrl: string, html: string): Promise<CssTokens> {
  const cssUrls = findStylesheetUrls(html, htmlUrl);
  const subset = cssUrls.slice(0, MAX_STYLESHEETS);

  const results = await Promise.allSettled(subset.map(fetchCss));

  const merged: CssTokens = {
    colorFrequencies: {},
    fontFamilies: [],
    cssVariables: {},
    mediaBreakpoints: [],
    fontSizeValues: [],
    radiusValues: [],
    spacingValues: [],
    easingValues: [],
    stylesheetsRead: 0,
    stylesheetsFailed: [],
  };

  const fontSet = new Set<string>();
  const breakpointSet = new Set<string>();
  const fontSizeSet = new Set<string>();
  const radiusSet = new Set<string>();
  const spacingSet = new Set<string>();
  const easingSet = new Set<string>();

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status !== "fulfilled" || r.value === null) {
      merged.stylesheetsFailed.push(subset[i]);
      continue;
    }
    const css = r.value;
    merged.stylesheetsRead++;

    // Colors
    for (const [hex, n] of Object.entries(extractColorFreqs(css))) {
      merged.colorFrequencies[hex] = (merged.colorFrequencies[hex] || 0) + n;
    }

    // Fonts
    extractFontFamilies(css).forEach((f) => fontSet.add(f));

    // CSS variables
    Object.assign(merged.cssVariables, extractCssVariables(css));

    // Breakpoints
    extractMediaBreakpoints(css).forEach((b) => breakpointSet.add(b));

    // Font sizes
    extractFontSizes(css).forEach((s) => fontSizeSet.add(s));

    // Radii
    extractRadii(css).forEach((s) => radiusSet.add(s));

    // Spacing
    extractSpacingValues(css).forEach((s) => spacingSet.add(s));

    // Easing
    extractEasing(css).forEach((s) => easingSet.add(s));
  }

  merged.fontFamilies = [...fontSet].slice(0, 12);
  merged.mediaBreakpoints = [...breakpointSet].slice(0, 12);
  merged.fontSizeValues = [...fontSizeSet].slice(0, 16);
  merged.radiusValues = [...radiusSet].slice(0, 8);
  merged.spacingValues = [...spacingSet].slice(0, 16);
  merged.easingValues = [...easingSet].slice(0, 6);

  return merged;
}

// ─── HTML → list of stylesheet URLs ───────────────────────────────────

function findStylesheetUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const linkRegex = /<link\b[^>]*?>/gi;
  for (const m of html.match(linkRegex) || []) {
    if (!/rel\s*=\s*["']?stylesheet/i.test(m)) continue;
    const href = m.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!href) continue;
    try {
      const resolved = new URL(href, baseUrl).toString();
      if (!/^https?:/i.test(resolved)) continue;
      urls.push(resolved);
    } catch {
      /* malformed; skip */
    }
  }
  return urls;
}

async function fetchCss(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), STYLESHEET_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/css,*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const reader = res.body?.getReader();
    if (!reader) return await res.text();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < STYLESHEET_MAX_BYTES) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.length;
    }
    try {
      await reader.cancel();
    } catch {}
    return new TextDecoder("utf-8").decode(concat(chunks));
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let i = 0;
  for (const c of chunks) {
    out.set(c, i);
    i += c.length;
  }
  return out;
}

// ─── Token extractors (regex against raw CSS) ─────────────────────────

function extractColorFreqs(css: string): Record<string, number> {
  const freqs: Record<string, number> = {};
  // Hex values — 3, 4, 6 or 8 digits.
  const hexRegex = /#([0-9a-f]{3,8})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = hexRegex.exec(css)) !== null) {
    const hex = normalizeHex(m[0]);
    if (!hex) continue;
    freqs[hex] = (freqs[hex] || 0) + 1;
  }
  // rgb()/rgba() — convert to hex for easy comparison.
  const rgbRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[0-9.]+\s*)?\)/g;
  while ((m = rgbRegex.exec(css)) !== null) {
    const r = clamp(parseInt(m[1], 10), 0, 255);
    const g = clamp(parseInt(m[2], 10), 0, 255);
    const b = clamp(parseInt(m[3], 10), 0, 255);
    const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
    freqs[hex] = (freqs[hex] || 0) + 1;
  }
  return freqs;
}

function normalizeHex(raw: string): string | null {
  const h = raw.replace("#", "").toLowerCase();
  if (h.length === 3) {
    return ("#" + [...h].map((c) => c + c).join("")).toUpperCase();
  }
  if (h.length === 4 || h.length === 8) {
    // Strip alpha for color analysis
    const noAlpha = h.length === 4 ? h.slice(0, 3) : h.slice(0, 6);
    return normalizeHex("#" + noAlpha);
  }
  if (h.length === 6) {
    return ("#" + h).toUpperCase();
  }
  return null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function extractFontFamilies(css: string): string[] {
  const found = new Set<string>();
  // @font-face blocks
  const ffaceRegex = /@font-face\s*\{[^}]*?font-family\s*:\s*["']?([^"';{}]+?)["']?\s*[;}]/gi;
  let m: RegExpExecArray | null;
  while ((m = ffaceRegex.exec(css)) !== null) {
    const name = cleanFontName(m[1]);
    if (name) found.add(name);
  }
  // Quoted font-family declarations
  const ffRegex = /font-family\s*:\s*["']([^"';{}]{2,40})["']/g;
  while ((m = ffRegex.exec(css)) !== null) {
    const name = cleanFontName(m[1]);
    if (name) found.add(name);
  }
  return [...found];
}

function cleanFontName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return null;
  if (
    /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit|initial|unset|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|emoji|math)$/i.test(
      name
    )
  ) {
    return null;
  }
  return name;
}

function extractCssVariables(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  // --name: value;  — capture only inside :root / :where(:root) / html for cleanliness;
  // but most projects also declare globals at top-level @media or component scope.
  // For our purposes, any --name: value is a candidate.
  const re = /--([\w-]+)\s*:\s*([^;{}]+?)\s*;/g;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = re.exec(css)) !== null && count < 64) {
    const k = m[1];
    const v = m[2].trim();
    // Skip multi-line / fallback chains we don't want to surface
    if (v.length > 100) continue;
    vars[`--${k}`] = v;
    count++;
  }
  return vars;
}

function extractMediaBreakpoints(css: string): string[] {
  const out: string[] = [];
  const re = /@media\s+(?:only\s+)?(?:screen\s+and\s+|all\s+and\s+)?([^{]+)\s*\{/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const cond = m[1].trim().replace(/\s+/g, " ");
    if (/min-width|max-width/.test(cond)) out.push(cond);
  }
  return out;
}

function extractFontSizes(css: string): string[] {
  const out: string[] = [];
  const re = /font-size\s*:\s*([^;{}]+?)\s*[;}]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const v = m[1].trim();
    // Filter to plausible scale values; skip clamp() / calc() / variable refs.
    if (/^[0-9.]+(?:px|rem|em|%)$/.test(v)) out.push(v);
  }
  return out;
}

function extractRadii(css: string): string[] {
  const out: string[] = [];
  const re = /border-radius\s*:\s*([^;{}]+?)\s*[;}]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const v = m[1].trim();
    if (v.length > 30) continue;
    out.push(v);
  }
  return out;
}

function extractSpacingValues(css: string): string[] {
  const out = new Set<string>();
  // padding / margin shorthand and long form, gap.
  const re = /(padding|margin|gap|row-gap|column-gap)\s*:\s*([^;{}]+?)\s*[;}]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const tokens = m[2].split(/\s+/);
    for (const t of tokens) {
      // Plausible spacing values only.
      if (/^[0-9.]+(?:px|rem|em)$/.test(t)) out.add(t);
    }
  }
  return [...out];
}

function extractEasing(css: string): string[] {
  const out = new Set<string>();
  const re = /cubic-bezier\(\s*[^)]+\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) out.add(m[0].replace(/\s+/g, " "));
  // Also catch named timings.
  const named = /transition[^;{}]*?\b(linear|ease|ease-in|ease-out|ease-in-out)\b/gi;
  while ((m = named.exec(css)) !== null) out.add(m[1]);
  return [...out];
}
