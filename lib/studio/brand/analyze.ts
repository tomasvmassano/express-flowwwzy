/**
 * Vision analysis for brand guidelines extraction.
 *
 * Inputs Claude Sonnet receives:
 *   - the screenshot (resized JPEG)
 *   - HTML hints (declared fonts, theme-color, title, description)
 *   - CSS tokens (color frequencies, exact font names, CSS variables,
 *     breakpoints, font sizes, radii, easing curves)
 *   - the URL itself
 *
 * Output: a complete ExtractedBrandGuidelines object via tool use,
 * which forces structural validity. The resulting JSON is a brand
 * manual rivalling a hand-crafted one — all sections of the
 * Flowwwzy_Complete_Guidelines.pdf shape filled in.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ExtractedBrandGuidelines, ExtractedBrandGuidelinesSchema } from "./types";
import type { EnrichmentHints } from "../extractor/html-enrich";
import type { CssTokens } from "./cssTokenizer";

const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `És um designer sénior a documentar a identidade de uma marca a partir do website dela. O teu output é um manual de brand guidelines estruturado, ao mesmo nível de qualidade do que um estúdio sénior produziria depois de uma auditoria completa.

Princípios do manual:
- Sê específico, não vago. "Black & cream com cream usado para acentos italicizados" é específico. "Premium e moderno" é vago.
- Usa os valores AUTORITATIVOS dos CSS tokens quando disponíveis. Não inventes hex codes se a CSS já te dá os exatos.
- Para typography, mapeia o nome da fonte (e.g. "Satoshi") para a classification correta (sans-geometric / sans-grotesque / serif-display / etc.).
- Para o type scale, usa valores reais quando os encontras nos CSS tokens (font-size declarations).
- Design principles e web principles: 4-6 each, numerados. Cada um tem um título curto e uma descrição de 2-3 frases que explica o "porquê".
- Section archetypes: identifica 4-8 tipos de secção que existem no site (hero, services, testimonials, etc.) com tratamento concreto.
- Motion: cubic-bezier values exatos quando aparecem; senão deduz de easing language ("snappy", "calm").
- Logo rules: se a marca tiver características distintivas (typography custom, terminal punctuation, triple-letter signature), CAPTURA-OS. Estes são os detalhes que tornam a marca reconhecível.
- Summary: 2-4 frases que descrevam a personalidade da marca em termos concretos. Não use clichês como "moderno e fresco".

Output via a ferramenta extract_brand_guidelines. Não respondas em texto livre.`;

function formatHintsBlock(hints: EnrichmentHints | undefined, css: CssTokens, url: string): string {
  const lines: string[] = [];
  lines.push(`URL: ${url}`);
  if (hints?.pageTitle) lines.push(`Title: ${hints.pageTitle}`);
  if (hints?.pageDescription) lines.push(`Description: ${hints.pageDescription}`);
  if (hints?.themeColor) lines.push(`Declared theme-color: ${hints.themeColor}`);
  if (hints?.language) lines.push(`Language: ${hints.language}`);
  if (hints?.declaredFonts && hints.declaredFonts.length > 0) {
    lines.push(`Declared fonts (HTML): ${hints.declaredFonts.join(", ")}`);
  }

  if (css.fontFamilies.length > 0) {
    lines.push(`Fonts in CSS: ${css.fontFamilies.join(", ")}`);
  }

  // Top 12 colors by frequency
  const topColors = Object.entries(css.colorFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([hex, n]) => `${hex} (${n})`);
  if (topColors.length > 0) {
    lines.push(`Top colors in CSS (with frequency): ${topColors.join(", ")}`);
  }

  // CSS variables — only show first 16 to keep the prompt under control
  const vars = Object.entries(css.cssVariables).slice(0, 16);
  if (vars.length > 0) {
    lines.push(`CSS variables: ${vars.map(([k, v]) => `${k}=${v}`).join("; ")}`);
  }

  if (css.fontSizeValues.length > 0) {
    lines.push(`Font sizes seen: ${css.fontSizeValues.slice(0, 8).join(", ")}`);
  }
  if (css.radiusValues.length > 0) {
    lines.push(`Border radii: ${css.radiusValues.slice(0, 6).join(", ")}`);
  }
  if (css.spacingValues.length > 0) {
    lines.push(`Spacing values: ${css.spacingValues.slice(0, 12).join(", ")}`);
  }
  if (css.easingValues.length > 0) {
    lines.push(`Easing curves: ${css.easingValues.join(", ")}`);
  }
  if (css.mediaBreakpoints.length > 0) {
    lines.push(`Media breakpoints: ${css.mediaBreakpoints.slice(0, 6).join(", ")}`);
  }

  return lines.join("\n");
}

export async function analyzeForBrandGuidelines(
  imageBase64: string,
  url: string,
  hints: EnrichmentHints | undefined,
  cssTokens: CssTokens,
  mediaType: "image/png" | "image/jpeg" = "image/jpeg"
): Promise<{ guidelines: ExtractedBrandGuidelines; rawJson: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  const toolSchema = z.toJSONSchema(ExtractedBrandGuidelinesSchema, { target: "draft-7" });

  const tool = {
    name: "extract_brand_guidelines",
    description:
      "Extract a complete brand guidelines manual from a website screenshot + CSS analysis. All sections required.",
    input_schema: toolSchema as Anthropic.Messages.Tool.InputSchema,
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    tools: [tool],
    tool_choice: { type: "tool", name: "extract_brand_guidelines" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Analisa este site e produz o manual completo de brand guidelines.

CONTEXTO EXTRAÍDO DO HTML/CSS (usa estes valores AUTORITATIVOS quando possível):
${formatHintsBlock(hints, cssTokens, url)}

Devolve via a ferramenta extract_brand_guidelines.`,
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (c): c is Anthropic.Messages.ToolUseBlock => c.type === "tool_use"
  );
  if (!toolUse) {
    throw new Error(`No tool_use in response. Stop reason: ${message.stop_reason}`);
  }

  const parsed = ExtractedBrandGuidelinesSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(
      `Brand guidelines failed schema validation: ${parsed.error.message}\nRaw: ${JSON.stringify(
        toolUse.input
      ).slice(0, 600)}`
    );
  }

  return { guidelines: parsed.data, rawJson: JSON.stringify(toolUse.input, null, 2) };
}
