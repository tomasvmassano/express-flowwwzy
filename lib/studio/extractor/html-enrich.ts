/**
 * HTML enrichment — pulls cheap, authoritative signals from a URL's HTML
 * to feed alongside the screenshot to Claude's vision call.
 *
 * What we extract (all optional):
 *   - declaredFonts:    Google Fonts and @font-face family names. Authoritative
 *                       typography info that the vision model would otherwise
 *                       have to guess from rendered glyphs alone.
 *   - themeColor:       <meta name="theme-color"> — the brand's stated primary.
 *   - pageTitle / description:  text context for mood inference.
 *   - language:         <html lang> — drives copy language assumptions.
 *   - ogImageUrl:       social card; sometimes the cleanest brand-shot.
 *
 * Why HTML alongside vision (not instead of):
 *   - HTML misses the signals that matter most for mood/density/palette
 *     (modern sites resolve color through layered CSS variables; mood is
 *     a feel, not a tag). Vision captures those.
 *   - But HTML gives us authoritative font names — a site loading "Fraunces"
 *     leaves no doubt about its display typography. Better than asking the
 *     model to classify it from the rendered glyphs.
 *
 * Robustness: this never throws. If the fetch fails or the HTML is opaque
 * (SPA shell), we return an empty hints object and the orchestrator
 * proceeds with vision-only.
 */

export type EnrichmentHints = {
  declaredFonts: string[];
  themeColor?: string;
  pageTitle?: string;
  pageDescription?: string;
  language?: string;
  ogImageUrl?: string;
};

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; FlowwwzyStudio/1.0; +https://flowwwzy.com/studio)";

export async function enrichFromHtml(url: string): Promise<EnrichmentHints> {
  let html = "";
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,*/*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return empty();
    // Cap HTML to 256KB — head + a sliver of body is enough for our regexes.
    const reader = res.body?.getReader();
    if (!reader) {
      html = await res.text();
    } else {
      const max = 256 * 1024;
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (total < max) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
        total += value.length;
      }
      try {
        await reader.cancel();
      } catch {}
      html = new TextDecoder("utf-8").decode(concat(chunks));
    }
  } catch {
    return empty();
  }

  return parseHints(html);
}

function empty(): EnrichmentHints {
  return { declaredFonts: [] };
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

function parseHints(html: string): EnrichmentHints {
  const lower = html.toLowerCase();
  const head = html.slice(0, 64 * 1024); //  most signals live in <head>

  return {
    declaredFonts: extractFonts(head, lower),
    themeColor: extractMeta(head, "theme-color") || undefined,
    pageTitle: extractTitle(head)?.slice(0, 200),
    pageDescription: extractMeta(head, "description")?.slice(0, 400),
    language: extractAttr(head, "html", "lang")?.slice(0, 12),
    ogImageUrl: extractMetaProp(head, "og:image") || undefined,
  };
}

// ─── Extractors (regex-based; HTML is messy, robustness > strictness) ───

function extractFonts(head: string, lower: string): string[] {
  const found = new Set<string>();

  // Google Fonts CSS API (v1):
  //   <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter|Fraunces:400">
  // and (v2):
  //   https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,500&family=Inter:wght@400;500
  const gfRegex = /https?:\/\/fonts\.googleapis\.com\/css2?\?[^"'\s>]+/g;
  for (const m of head.match(gfRegex) || []) {
    for (const family of parseGoogleFontsUrl(m)) {
      found.add(family);
    }
  }

  // @font-face declarations inline or in linked CSS we won't fetch — but the
  // family name often appears as font-family: "X" elsewhere in the HTML.
  // Quick wins: <style>...font-family: "X"...</style>
  const ffRegex = /font-family\s*:\s*["']([^"']{2,40})["']/g;
  let mm: RegExpExecArray | null;
  while ((mm = ffRegex.exec(head)) !== null) {
    const candidate = mm[1].trim();
    // Skip generic stacks like 'sans-serif'
    if (/^(serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(candidate)) continue;
    found.add(candidate);
  }

  // Adobe Fonts (Typekit) — kit IDs, but the family name isn't always exposed
  // in the link. Skip; vision will catch it.

  // Cap at 6 — we don't need more than the top families.
  return Array.from(found).slice(0, 6);
}

function parseGoogleFontsUrl(url: string): string[] {
  const out: string[] = [];
  // family= can repeat (v2: &family=, v1: &family= or |-separated)
  const familyParams = url.match(/family=([^&]+)/g) || [];
  for (const param of familyParams) {
    const raw = decodeURIComponent(param.replace("family=", ""));
    // v1 splits multiple families with `|`
    for (const piece of raw.split("|")) {
      // e.g. "Fraunces:ital,wght@1,500" → "Fraunces"
      const family = piece.split(":")[0].replace(/\+/g, " ").trim();
      if (family) out.push(family);
    }
  }
  return out;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+name=["']${escape(name)}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return m[1];
  // also support content first, then name
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*name=["']${escape(name)}["']`,
    "i"
  );
  return html.match(re2)?.[1] ?? null;
}

function extractMetaProp(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+property=["']${escape(prop)}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  return html.match(re)?.[1] ?? null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
  if (!m) return null;
  return m[1].replace(/\s+/g, " ").trim();
}

function extractAttr(html: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${escape(tag)}\\b[^>]*\\b${escape(attr)}=["']([^"']+)["']`, "i");
  return html.match(re)?.[1] ?? null;
}

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
