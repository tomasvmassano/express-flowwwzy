/**
 * Content synthesis — Claude generates copy for each section's slots
 * informed by the project's full context (form + brand + references +
 * intake). Single batched call per project to keep token use efficient.
 *
 * The model is forced via tool_use to emit a JSON object keyed by
 * section ID with one slot map per section. This avoids loose text
 * parsing and lets us validate per-section.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Project, PlanSection } from "../project/types";
import type { ComponentManifest } from "../types";

const MODEL = "claude-sonnet-4-5";

export type SectionToFill = {
  /** Stable section identifier the model will use as key */
  sectionId: string;
  category: string;
  manifestId: string;
  manifest: ComponentManifest;
};

const SystemPromptTemplate = `És um senior copywriter + design strategist a preencher uma landing page completa para uma empresa real.

Princípios:
- Cada slot recebe APENAS o tipo correto. text-short = 1 frase. text-long = 1-2 parágrafos. list = array de items. url = URL válida ou string vazia. image = URL de imagem ou string vazia.
- Conteúdo concreto, NÃO genérico. "Ajudamos restaurantes em Lisboa a aumentar reservas online em 40%" > "Soluções para o seu negócio". Usa nomes, números, locais, e linguagem específica do negócio do cliente.
- Português Europeu (você form, não tu). Sem clichés ("revolucionário", "incrível", "moderno"). Sem em dashes.
- Quando há brand guidelines com voz/personalidade, USA esse tom. Quando há referências aspiracionais, mimica o ritmo/expressividade tipográfica do hero ref.
- Se não há informação suficiente para um slot, deixa string vazia OU array vazio. Não inventes números nem testemunhos. Não inventes URLs.

Output via a ferramenta fill_sections — um objeto cujas keys são os sectionIds e values são objetos com {slotKey: slotValue}. Não respondas em texto livre.`;

function summarizeProjectForPrompt(project: Project): string {
  const lines: string[] = [];

  lines.push(`# Cliente`);
  lines.push(`Nome: ${project.form.business.name || "(não definido)"}`);
  if (project.form.business.what) lines.push(`O que faz: ${project.form.business.what}`);
  if (project.form.business.differentiator)
    lines.push(`Diferenciador: ${project.form.business.differentiator}`);

  if (project.form.vsl?.state === "have_it" && project.form.vsl.embedUrl) {
    lines.push(`VSL embed URL: ${project.form.vsl.embedUrl}`);
  }

  if (project.brandGuidelines) {
    const eg = project.brandGuidelines.extracted;
    lines.push(`\n# Brand voice & identity`);
    lines.push(`Brand: ${eg.brand.name}`);
    if (eg.brand.tagline) lines.push(`Tagline: ${eg.brand.tagline}`);
    if (eg.brand.industry) lines.push(`Industry: ${eg.brand.industry}`);
    lines.push(`Summary: ${eg.summary}`);
    if (eg.designPrinciples.length > 0) {
      lines.push(`Design principles:`);
      for (const p of eg.designPrinciples.slice(0, 5)) {
        lines.push(`  - ${p.title}: ${p.description}`);
      }
    }
  }

  const aspirational = project.references.filter((r) => r.purpose === "aspirational" && r.dna);
  if (aspirational.length > 0) {
    lines.push(`\n# Referências aspiracionais (mimica ritmo/voz)`);
    for (const ref of aspirational.slice(0, 3)) {
      lines.push(`- ${ref.url}`);
      if (ref.dna?.summary) lines.push(`  ${ref.dna.summary}`);
    }
  }

  const competitors = project.references.filter((r) => r.purpose === "competitor" && r.dna);
  if (competitors.length > 0) {
    lines.push(`\n# Concorrentes (NÃO te pareças com isto)`);
    for (const ref of competitors.slice(0, 3)) {
      lines.push(`- ${ref.url}: ${ref.dna?.summary || "(no summary)"}`);
    }
  }

  return lines.join("\n");
}

function describeSection(s: SectionToFill): string {
  const slotLines = s.manifest.slots
    .map((slot) => {
      const required = slot.required ? "REQUIRED" : "optional";
      const max = slot.maxChars ? ` ≤${slot.maxChars}ch` : "";
      const hint = slot.hint ? ` — ${slot.hint}` : "";
      return `    "${slot.key}" (${slot.type}, ${required}${max}): ${slot.label}${hint}`;
    })
    .join("\n");

  return `  Section "${s.sectionId}" — category=${s.category}, manifestId=${s.manifestId}\n${slotLines}`;
}

export async function synthesizeAllSectionContent(
  project: Project,
  sections: SectionToFill[]
): Promise<Record<string, Record<string, unknown>>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  // Tool schema: object keyed by sectionId, each value an open object
  // (we don't enforce per-slot shape at the JSON-Schema level because
  // it varies per manifest; we validate in a second pass after parsing).
  const properties: Record<string, { type: "object"; description: string }> = {};
  for (const s of sections) {
    properties[s.sectionId] = {
      type: "object",
      description: `Content map for section ${s.sectionId} (${s.category}/${s.manifestId})`,
    };
  }
  const toolSchema = {
    type: "object" as const,
    properties,
    required: sections.map((s) => s.sectionId),
    additionalProperties: false,
  };

  const tool = {
    name: "fill_sections",
    description:
      "Fill content for every section of the LP. Keys = sectionIds, values = slot maps for that section.",
    input_schema: toolSchema as Anthropic.Messages.Tool.InputSchema,
  };

  const projectSummary = summarizeProjectForPrompt(project);
  const sectionList = sections.map(describeSection).join("\n\n");

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SystemPromptTemplate,
    tools: [tool],
    tool_choice: { type: "tool", name: "fill_sections" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Preenche o conteúdo de cada secção com base no contexto do cliente.

CONTEXT:
${projectSummary}

SECTIONS A PREENCHER:
${sectionList}

Devolve via a ferramenta fill_sections.`,
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

  const result = toolUse.input as Record<string, Record<string, unknown>>;
  // Light validation — ensure every requested section has an entry.
  for (const s of sections) {
    if (!result[s.sectionId]) {
      result[s.sectionId] = {};
    }
  }
  return result;
}
