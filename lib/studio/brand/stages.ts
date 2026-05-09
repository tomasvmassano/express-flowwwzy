/**
 * Staged brand guidelines extraction — splits the single big Claude
 * vision call into 4 focused fragments so each individual call is
 * 5-12s instead of 20-40s. Each stage:
 *   - has its own focused tool schema
 *   - is cached independently in KV
 *   - can fail without breaking the others
 *   - can be re-extracted alone
 *
 * Operator UX: per-element progress in the studio UI ("Identity ✓",
 * "Visuals ⏳", "Technical · pending", "Principles · pending").
 *
 * Cost tradeoff: 4 Claude calls vs 1, but each is ~30-50% the size of
 * the original. Net cost ~3x; worth it for the reliability + UX.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { EnrichmentHints } from "../extractor/html-enrich";
import type { CssTokens } from "./cssTokenizer";
import {
  ColorEntrySchema,
  TypographySchema,
  LayoutSystemSchema,
  ComponentRulesSchema,
  MotionSystemSchema,
  DesignPrincipleSchema,
  SectionArchetypeSchema,
} from "./types";

const MODEL = "claude-sonnet-4-5";

// ─── Stage schemas (fragments of ExtractedBrandGuidelines) ───────────

export const IdentityFragmentSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string().optional(),
    description: z.string().optional(),
    industry: z.string().optional(),
  }),
  summary: z.string(),
});
export type IdentityFragment = z.infer<typeof IdentityFragmentSchema>;

export const VisualsFragmentSchema = z.object({
  logo: z.object({
    sourceUrl: z.string().url().optional(),
    style: z.enum(["wordmark", "lockup", "icon-only", "icon-and-wordmark"]),
    rules: z.array(z.string()).default([]),
    distinctiveFeatures: z.string().optional(),
  }),
  colorSystem: z.object({
    isDarkFirst: z.boolean(),
    core: z.array(ColorEntrySchema).min(1).max(12),
    accent: z.array(ColorEntrySchema).default([]),
    defaultPairing: z.string().optional(),
  }),
});
export type VisualsFragment = z.infer<typeof VisualsFragmentSchema>;

export const TechnicalFragmentSchema = z.object({
  typography: TypographySchema,
  layout: LayoutSystemSchema,
  components: ComponentRulesSchema,
});
export type TechnicalFragment = z.infer<typeof TechnicalFragmentSchema>;

export const PrinciplesFragmentSchema = z.object({
  designPrinciples: z.array(DesignPrincipleSchema).max(10).default([]),
  sectionArchetypes: z.array(SectionArchetypeSchema).default([]),
  webPrinciples: z.array(DesignPrincipleSchema).max(10).default([]),
  motion: MotionSystemSchema,
});
export type PrinciplesFragment = z.infer<typeof PrinciplesFragmentSchema>;

// ─── Shared prompt context ───────────────────────────────────────────

function formatContext(url: string, hints?: EnrichmentHints, css?: CssTokens): string {
  const lines: string[] = [`URL: ${url}`];
  if (hints?.pageTitle) lines.push(`Title: ${hints.pageTitle}`);
  if (hints?.pageDescription) lines.push(`Description: ${hints.pageDescription}`);
  if (hints?.themeColor) lines.push(`Theme color (HTML meta): ${hints.themeColor}`);
  if (hints?.declaredFonts && hints.declaredFonts.length > 0) {
    lines.push(`Fonts declared (HTML): ${hints.declaredFonts.join(", ")}`);
  }
  if (css?.fontFamilies && css.fontFamilies.length > 0) {
    lines.push(`Fonts in CSS: ${css.fontFamilies.join(", ")}`);
  }
  if (css?.colorFrequencies) {
    const top = Object.entries(css.colorFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([h, n]) => `${h}(${n})`);
    if (top.length > 0) lines.push(`Top colors in CSS: ${top.join(", ")}`);
  }
  if (css?.cssVariables) {
    const vars = Object.entries(css.cssVariables).slice(0, 12);
    if (vars.length > 0) lines.push(`CSS vars: ${vars.map(([k, v]) => `${k}=${v}`).join("; ")}`);
  }
  if (css?.fontSizeValues && css.fontSizeValues.length > 0) {
    lines.push(`Font sizes: ${css.fontSizeValues.slice(0, 8).join(", ")}`);
  }
  if (css?.radiusValues && css.radiusValues.length > 0) {
    lines.push(`Radii: ${css.radiusValues.slice(0, 6).join(", ")}`);
  }
  if (css?.easingValues && css.easingValues.length > 0) {
    lines.push(`Easing: ${css.easingValues.join(", ")}`);
  }
  if (css?.mediaBreakpoints && css.mediaBreakpoints.length > 0) {
    lines.push(`Breakpoints: ${css.mediaBreakpoints.slice(0, 6).join(", ")}`);
  }
  return lines.join("\n");
}

async function callClaudeWithTool<T>(opts: {
  systemPrompt: string;
  toolName: string;
  toolDescription: string;
  schema: z.ZodType<T>;
  imageBase64: string;
  mediaType: "image/png" | "image/jpeg";
  userText: string;
}): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });

  const inputSchema = z.toJSONSchema(opts.schema, { target: "draft-7" });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: opts.systemPrompt,
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: inputSchema as Anthropic.Messages.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: opts.mediaType, data: opts.imageBase64 } },
          { type: "text", text: opts.userText },
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
  const parsed = opts.schema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Schema validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

// ─── Stage runners ───────────────────────────────────────────────────

const SHARED_RULES = `Princípios:
- Sê específico, não vago. "Black & cream com cream usado para acentos italicizados" é específico. "Premium e moderno" é vago.
- Usa os valores AUTORITATIVOS dos CSS tokens quando disponíveis. Não inventes hex codes ou nomes de fontes se a CSS já te dá os exatos.
- Português Europeu nos campos de texto livre (summary, descrições, principles).`;

export async function runIdentityStage(
  imageBase64: string,
  mediaType: "image/png" | "image/jpeg",
  url: string,
  hints?: EnrichmentHints,
  css?: CssTokens
): Promise<IdentityFragment> {
  return await callClaudeWithTool({
    systemPrompt: `És um designer sénior a documentar a identidade verbal de uma marca a partir do site dela.
${SHARED_RULES}
- Brand name é o nome real da empresa (não o page title cheio de SEO).
- Tagline é a frase curta de posicionamento se existir.
- Industry: o setor numa palavra ou duas.
- Summary tem 2-4 frases descrevendo a personalidade da marca em termos concretos. Sem clichés ("revolucionário", "incrível").

Devolve via a ferramenta extract_identity.`,
    toolName: "extract_identity",
    toolDescription: "Brand identity (name, tagline, summary, industry).",
    schema: IdentityFragmentSchema,
    imageBase64,
    mediaType,
    userText: `Analisa esta screenshot e extrai a identidade da marca.\n\nCONTEXTO:\n${formatContext(url, hints, css)}`,
  });
}

export async function runVisualsStage(
  imageBase64: string,
  mediaType: "image/png" | "image/jpeg",
  url: string,
  hints?: EnrichmentHints,
  css?: CssTokens
): Promise<VisualsFragment> {
  return await callClaudeWithTool({
    systemPrompt: `És um designer sénior a documentar logo + paleta de cores de uma marca.
${SHARED_RULES}
- Logo: classifica style (wordmark, lockup, icon-only, icon-and-wordmark). Captura rules distintivas (e.g. triple-W, terminal punctuation, nunca em fundo X).
- distinctiveFeatures: o que torna o logo memorável — typographic detail, custom letterform, etc.
- Color system: 3-8 cores core (com hex + name + usage). Accent palette opcional. defaultPairing descreve como se combinam (e.g. "white text on black, cream for italic accent only").
- isDarkFirst: true se o site assume backgrounds escuros como default.

Devolve via a ferramenta extract_visuals.`,
    toolName: "extract_visuals",
    toolDescription: "Logo + colour system.",
    schema: VisualsFragmentSchema,
    imageBase64,
    mediaType,
    userText: `Analisa esta screenshot e extrai logo + sistema de cores.\n\nCONTEXTO:\n${formatContext(url, hints, css)}`,
  });
}

export async function runTechnicalStage(
  imageBase64: string,
  mediaType: "image/png" | "image/jpeg",
  url: string,
  hints?: EnrichmentHints,
  css?: CssTokens
): Promise<TechnicalFragment> {
  return await callClaudeWithTool({
    systemPrompt: `És um designer sénior a documentar a infraestrutura técnica de design (typography, layout, components).
${SHARED_RULES}
- Typography families: identifica até 4. Cada uma com classification (sans-neutral / sans-humanist / sans-geometric / sans-grotesque / serif-classic / serif-modern / serif-display / serif-slab / mono / script), role (display/body/accent/label/mono).
- Type scale: usa valores reais do CSS quando disponíveis (font-size declarations).
- Layout: container max-width, breakpoints reais (do CSS), section padding, common grid templates.
- Components: button variants com background+text+padding+radius, corner radii usados, shadow tokens, border treatment.

Devolve via a ferramenta extract_technical.`,
    toolName: "extract_technical",
    toolDescription: "Typography + layout system + component rules.",
    schema: TechnicalFragmentSchema,
    imageBase64,
    mediaType,
    userText: `Analisa esta screenshot e extrai sistema técnico de design.\n\nCONTEXTO:\n${formatContext(url, hints, css)}`,
  });
}

export async function runPrinciplesStage(
  imageBase64: string,
  mediaType: "image/png" | "image/jpeg",
  url: string,
  hints?: EnrichmentHints,
  css?: CssTokens
): Promise<PrinciplesFragment> {
  return await callClaudeWithTool({
    systemPrompt: `És um designer sénior a articular os princípios de design + section archetypes + motion de uma marca.
${SHARED_RULES}
- Design principles: 4-6 numerados. Cada um título curto + descrição 2-3 frases que explica o "porquê". Concretos: "Dark by default", "Cream is decorative" — não "Modern and clean".
- Section archetypes: 4-8 tipos de secção observados, com tratamento concreto.
- Web principles: 4-6 numerados (princípios de extensão do site sem partir o sistema).
- Motion: cubic-bezier values exatos quando aparecem nos CSS tokens. Senão deduz de easing language.

Devolve via a ferramenta extract_principles.`,
    toolName: "extract_principles",
    toolDescription: "Design principles + section archetypes + web principles + motion.",
    schema: PrinciplesFragmentSchema,
    imageBase64,
    mediaType,
    userText: `Analisa esta screenshot e extrai principles + archetypes + motion.\n\nCONTEXTO:\n${formatContext(url, hints, css)}`,
  });
}
