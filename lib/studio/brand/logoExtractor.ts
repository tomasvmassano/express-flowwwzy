/**
 * Logo extraction — finds the most likely logo asset on a page and
 * returns it as a normalized PNG (base64-encoded for cache transport).
 *
 * Heuristic candidate order (highest confidence first):
 *   1. Inline <svg> inside <header>
 *   2. <img> with logo-ish src/alt/class inside <header> or top of <body>
 *   3. <a href="/"> containing an img/svg in <header>
 *   4. <meta property="og:image">
 *   5. <link rel="apple-touch-icon">
 *   6. <link rel="icon"> / favicon.ico fallback
 *
 * Whichever candidate downloads first wins. SVGs are rasterised via
 * sharp; PNG/JPG/WebP/ICO are recompressed to a sane PNG. The final
 * PNG is capped at 512px on the longest edge.
 */

import sharp from "sharp";

const MAX_LOGO_PX = 512;
const FETCH_TIMEOUT_MS = 8000;
const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8",
};

export type ExtractedLogo = {
  pngBase64: string;
  mediaType: "image/png";
  sourceUrl: string;
  detectedFormat: "svg-inline" | "svg" | "png" | "jpg" | "webp" | "ico" | "other";
  width: number;
  height: number;
};

export async function extractLogo(rawHtml: string, pageUrl: string): Promise<ExtractedLogo | null> {
  const candidates = collectLogoCandidates(rawHtml, pageUrl);
  for (const c of candidates) {
    try {
      const result = await materializeCandidate(c);
      if (result) return result;
    } catch {
      // Fall through to next candidate.
    }
  }
  // Last resort: try /favicon.ico at the root.
  try {
    const root = new URL("/favicon.ico", pageUrl).toString();
    const result = await materializeCandidate({ kind: "external", url: root, format: "ico" });
    if (result) return result;
  } catch {
    /* nothing */
  }
  return null;
}

// ─── Candidate collection ────────────────────────────────────────────

type Candidate =
  | { kind: "inline-svg"; svg: string }
  | { kind: "external"; url: string; format: ExtractedLogo["detectedFormat"] };

function collectLogoCandidates(html: string, pageUrl: string): Candidate[] {
  const out: Candidate[] = [];
  const headerSlice = sliceHeader(html);

  // 1. Inline SVG inside <header>.
  const svgMatches = headerSlice.match(/<svg[\s\S]*?<\/svg>/gi) || [];
  for (const svg of svgMatches.slice(0, 3)) {
    out.push({ kind: "inline-svg", svg });
  }

  // 2. <img> in header with logo-ish attrs (class/alt/src/id contains "logo").
  const imgRe = /<img\b[^>]*>/gi;
  const headerImgs = (headerSlice.match(imgRe) || []).filter((tag) =>
    /logo/i.test(tag)
  );
  for (const tag of headerImgs.slice(0, 3)) {
    const src = pickAttr(tag, "src") || pickAttr(tag, "data-src");
    if (src) {
      const abs = resolveUrl(src, pageUrl);
      if (abs) out.push({ kind: "external", url: abs, format: detectFormat(abs) });
    }
  }

  // 3. Any <img> in header (less confident, but sites with no "logo" class still need pickup).
  const allHeaderImgs = headerSlice.match(imgRe) || [];
  for (const tag of allHeaderImgs.slice(0, 3)) {
    if (/logo/i.test(tag)) continue; // already added
    const src = pickAttr(tag, "src") || pickAttr(tag, "data-src");
    if (src) {
      const abs = resolveUrl(src, pageUrl);
      if (abs) out.push({ kind: "external", url: abs, format: detectFormat(abs) });
    }
  }

  // 4. og:image meta.
  const og = html.match(
    /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i
  ) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og) {
    const abs = resolveUrl(og[1], pageUrl);
    if (abs) out.push({ kind: "external", url: abs, format: detectFormat(abs) });
  }

  // 5. apple-touch-icon (typically 180×180, brand-themed).
  const apple = html.match(
    /<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i
  );
  if (apple) {
    const abs = resolveUrl(apple[1], pageUrl);
    if (abs) out.push({ kind: "external", url: abs, format: detectFormat(abs) });
  }

  // 6. <link rel="icon"> with type svg preferred over png/ico.
  const icons = [...html.matchAll(/<link\b[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi)];
  const iconRanked = icons
    .map((m) => m[0])
    .map((tag) => ({
      tag,
      href: pickAttr(tag, "href"),
      type: pickAttr(tag, "type") || "",
    }))
    .filter((x) => !!x.href)
    .sort((a, b) => {
      // Prefer svg, then png, then ico.
      const score = (t: string) =>
        /svg/i.test(t) ? 0 : /png/i.test(t) ? 1 : /ico/i.test(t) ? 2 : 3;
      return score(a.type) - score(b.type);
    });
  for (const it of iconRanked.slice(0, 3)) {
    const abs = resolveUrl(it.href!, pageUrl);
    if (abs) out.push({ kind: "external", url: abs, format: detectFormat(abs) });
  }

  return dedupe(out);
}

function sliceHeader(html: string): string {
  const m = html.match(/<header\b[\s\S]*?<\/header>/i);
  if (m) return m[0];
  // Fall back to first 16 KB of body — a logo usually shows up early.
  const bodyStart = html.search(/<body\b/i);
  if (bodyStart >= 0) return html.slice(bodyStart, bodyStart + 16000);
  return html.slice(0, 16000);
}

function pickAttr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}=["']([^"']+)["']`, "i");
  const m = tag.match(re);
  return m ? m[1] : null;
}

function resolveUrl(raw: string, base: string): string | null {
  try {
    return new URL(raw, base).toString();
  } catch {
    return null;
  }
}

function detectFormat(url: string): ExtractedLogo["detectedFormat"] {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".svg")) return "svg";
  if (u.endsWith(".png")) return "png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return "jpg";
  if (u.endsWith(".webp")) return "webp";
  if (u.endsWith(".ico")) return "ico";
  return "other";
}

function dedupe(cs: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of cs) {
    const key = c.kind === "inline-svg" ? c.svg.slice(0, 200) : c.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

// ─── Materialization ─────────────────────────────────────────────────

async function materializeCandidate(c: Candidate): Promise<ExtractedLogo | null> {
  if (c.kind === "inline-svg") {
    const buffer = Buffer.from(c.svg, "utf-8");
    return await rasterise(buffer, "svg-inline", "inline");
  }
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(c.url, { headers: FETCH_HEADERS, signal: ctrl.signal });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    if (ab.byteLength < 64 || ab.byteLength > 5_000_000) return null; // sanity
    const buffer = Buffer.from(ab);
    return await rasterise(buffer, c.format, c.url);
  } finally {
    clearTimeout(tm);
  }
}

async function rasterise(
  buffer: Buffer,
  format: ExtractedLogo["detectedFormat"],
  sourceUrl: string
): Promise<ExtractedLogo | null> {
  // sharp handles svg, png, jpg, webp natively. ICO requires a hint.
  const pipeline =
    format === "ico"
      ? sharp(buffer, { failOn: "none" })
      : sharp(buffer, { failOn: "none" });
  const png = await pipeline
    .resize({
      width: MAX_LOGO_PX,
      height: MAX_LOGO_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const meta = await sharp(png).metadata();
  if (!meta.width || !meta.height) return null;
  return {
    pngBase64: png.toString("base64"),
    mediaType: "image/png",
    sourceUrl,
    detectedFormat: format,
    width: meta.width,
    height: meta.height,
  };
}
