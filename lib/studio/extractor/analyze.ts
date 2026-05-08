/**
 * Vision analysis via Claude Sonnet with tool use.
 *
 * Forces the model to emit a valid ExtractedDNA via tool_choice, so the
 * output is always parseable JSON in the closed vocabulary. If the model
 * picks a value outside the schema enums, the tool call fails on the
 * Anthropic side — we never have to guard against drift in our code.
 */

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ExtractedDNA, ExtractedDNASchema } from "../types";

const MODEL = "claude-sonnet-4-5";

const SYSTEM_PROMPT = `És um designer sénior a analisar uma screenshot de um site real. A tua tarefa é extrair design DNA estruturada — não opiniões nem sugestões.

Princípios:
- Sê específico e consistente. Duas análises da mesma imagem devem produzir o mesmo output.
- Usa apenas valores definidos no schema da ferramenta. Não inventes tags.
- A tone slider escala de 0 a 100. Sê honesto: muitos sites são simultaneamente calmos E modernos.
- Para mood tags, escolhe 1-4 tags que melhor descrevam a sensação dominante. Não escolhas todas.
- O summary deve ter 2-3 frases em Português Europeu, descrevendo a sensação global. Sem adjetivos vazios ("incrível", "fantástico"). Foca-se em escolhas concretas (tipografia, paleta, ritmo, hierarquia).

Processo mental:
1. Tipografia primeiro: que classificação? Que par? Que feel? Que nível de expressividade (1-5)?
2. Paleta: 3-5 cores dominantes em hex. Identifica o background. É dark mode?
3. Densidade e alinhamento.
4. Imagery: estilo, treatment, presença humana.
5. Mood tags (1-4) que melhor capturam a vibe.
6. Tone (0-100) em três eixos.
7. Motion: se a screenshot não der pistas claras, escolhe "static".
8. Resume em 2-3 frases o que a torna distinta.

Devolve via a ferramenta extract_design_dna. Não respondas em texto livre.`;

export async function analyzeScreenshot(
  imageBase64: string,
  url: string,
  mediaType: "image/png" | "image/jpeg" = "image/jpeg"
): Promise<{ dna: ExtractedDNA; rawJson: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  // Convert the zod schema to JSON Schema for the tool.
  const toolSchema = z.toJSONSchema(ExtractedDNASchema, { target: "draft-7" });

  const tool = {
    name: "extract_design_dna",
    description:
      "Extract structured design DNA from a website screenshot. All fields are required.",
    input_schema: toolSchema as Anthropic.Messages.Tool.InputSchema,
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [tool],
    tool_choice: { type: "tool", name: "extract_design_dna" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Screenshot fonte: ${url}\n\nExtrai o design DNA usando a ferramenta.`,
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((c): c is Anthropic.Messages.ToolUseBlock => c.type === "tool_use");
  if (!toolUse) {
    throw new Error(`No tool_use in response. Stop reason: ${message.stop_reason}`);
  }

  const parsed = ExtractedDNASchema.safeParse(toolUse.input);
  if (!parsed.success) {
    // This should be rare — Anthropic validates against the JSON Schema before
    // accepting the tool call. If it happens, log the raw input for debugging.
    throw new Error(
      `Vision output failed schema validation: ${parsed.error.message}\nRaw: ${JSON.stringify(toolUse.input).slice(0, 500)}`
    );
  }

  return { dna: parsed.data, rawJson: JSON.stringify(toolUse.input, null, 2) };
}
