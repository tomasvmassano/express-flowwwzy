"use client";

import { useState, useMemo } from "react";
import type { Project, BrandGuidelines } from "@/lib/studio/project/types";
import type { ColorEntry } from "@/lib/studio/brand/types";
import type { StageMap } from "@/lib/studio/brand";
import { computeQualityScore } from "@/lib/studio/brand/qualityScore";

const STAGE_LABELS: Record<keyof StageMap, string> = {
  screenshot: "Screenshot",
  htmlData: "HTML + CSS",
  identity: "Identity",
  visuals: "Logo + Colors",
  technical: "Typography + Layout",
  principles: "Principles + Motion",
};
const STAGE_ORDER: (keyof StageMap)[] = [
  "screenshot",
  "htmlData",
  "identity",
  "visuals",
  "technical",
  "principles",
];

type Props = {
  project: Project;
  onPatch: (b: Partial<Project>) => Promise<Project | null>;
};

export default function BrandGuidelinesSection({ project, onPatch }: Props) {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<StageMap | null>(null);

  const existing = project.brandGuidelines;

  async function extract() {
    if (!url || !/^https?:\/\//i.test(url)) {
      setError("URL inválido");
      return;
    }
    setRunning(true);
    setError(null);
    setStages(null);
    setProgress("A iniciar Apify…");

    try {
      const kickRes = await fetch("/api/studio/brand-guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const kickData = await kickRes.json();
      if (!kickRes.ok || !kickData.jobId) {
        setError(kickData.message || kickData.error || `kickoff failed (${kickRes.status})`);
        setRunning(false);
        return;
      }

      // Poll
      const maxPolls = 80;
      let consecutiveBadResponses = 0;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 4000));
        let pollData: { status?: string; elapsedMs?: number; error?: string; capturedAt?: string; guidelines?: unknown; cssTokens?: unknown; stages?: StageMap };
        try {
          const qs = new URLSearchParams({ jobId: kickData.jobId, url });
          const pollRes = await fetch(`/api/studio/brand-guidelines?${qs.toString()}`, { cache: "no-store" });
          // Vercel function timeouts return text/html (504 page), not JSON.
          // Treat anything non-JSON as a transient retry so the next poll
          // can pick up the cached result the timed-out poll persisted.
          const ct = pollRes.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {
            consecutiveBadResponses++;
            setProgress(`A retomar… (${pollRes.status})`);
            if (consecutiveBadResponses > 5) {
              setError(`Backend não respondeu em JSON ${consecutiveBadResponses}x consecutivas. Tenta novamente.`);
              setRunning(false);
              return;
            }
            continue;
          }
          pollData = await pollRes.json();
          consecutiveBadResponses = 0;
        } catch (e) {
          consecutiveBadResponses++;
          setProgress(`Network glitch, a retomar…`);
          if (consecutiveBadResponses > 5) {
            setError(String(e));
            setRunning(false);
            return;
          }
          continue;
        }

        if (pollData.stages) setStages(pollData.stages);
        if (pollData.status === "running") {
          setProgress(`A processar… ${Math.round((pollData.elapsedMs || 0) / 1000)}s`);
          continue;
        }
        if (pollData.status === "failed") {
          setError(pollData.error || "extraction failed");
          setRunning(false);
          return;
        }
        if (pollData.status === "done") {
          setProgress("Análise terminada. A guardar no projeto…");
          const guidelines: BrandGuidelines = {
            source: { type: "url", url },
            capturedAt: pollData.capturedAt || new Date().toISOString(),
            extracted: pollData.guidelines as BrandGuidelines["extracted"],
            cssTokens: pollData.cssTokens,
          };
          await onPatch({ brandGuidelines: guidelines });
          setRunning(false);
          setProgress("");
          setUrl("");
          return;
        }
      }
      setError("Polling timeout (5 min). Tenta de novo.");
      setRunning(false);
    } catch (e) {
      setError(String(e));
      setRunning(false);
    }
  }

  async function clear() {
    if (!confirm("Apagar brand guidelines extraídas?")) return;
    await onPatch({ brandGuidelines: undefined });
  }

  return (
    <section className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888]">
          Brand guidelines {existing && <span className="text-emerald-400">·  ✓ extracted</span>}
        </h2>
        {existing && (
          <button onClick={clear} className="text-[10px] text-[#666] hover:text-red-400">
            Clear
          </button>
        )}
      </div>

      <div className="p-4">
        {!existing && (
          <>
            <p className="text-xs text-[#888] mb-3 leading-relaxed">
              Cola o URL de um site (atual do cliente, ou referência que represente a marca). Extraímos um manual completo de brand guidelines: identidade, tipografia, paleta, layout, princípios. O AI plan proposer (V3) usa isto como input principal.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !running && extract()}
                disabled={running}
                className="flex-1 bg-transparent border border-[#2A2A2A] rounded px-3 py-2 text-xs text-[#EDEDED] placeholder:text-[#444] focus:outline-none focus:border-[#666] disabled:opacity-50"
              />
              <button
                onClick={extract}
                disabled={!url || running}
                className="px-3 py-2 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 hover:bg-[#E0E0E0]"
              >
                {running ? "…" : "Extract"}
              </button>
            </div>
            {progress && (
              <div className="mt-3 text-[11px] text-amber-400 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {progress}
              </div>
            )}
            {stages && (
              <ul className="mt-3 space-y-1 text-[11px] font-mono">
                {STAGE_ORDER.map((key) => {
                  const s = stages[key];
                  const icon =
                    s.state === "done" ? "✓" : s.state === "failed" ? "✗" : "·";
                  const color =
                    s.state === "done"
                      ? "text-emerald-400"
                      : s.state === "failed"
                      ? "text-red-400"
                      : "text-[#666]";
                  const dur =
                    s.state === "failed"
                      ? s.error.slice(0, 40)
                      : s.state === "pending"
                      ? "pending"
                      : s.durationMs > 0
                      ? `${(s.durationMs / 1000).toFixed(1)}s`
                      : "cached";
                  return (
                    <li key={key} className={`flex items-center gap-3 ${color}`}>
                      <span className="w-3">{icon}</span>
                      <span className="w-32 text-[#CCC]">{STAGE_LABELS[key]}</span>
                      <span className="text-[#666] truncate">{dur}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {error && (
              <div className="mt-3 text-[11px] text-red-400 break-words">{error}</div>
            )}
            <p className="mt-3 text-[10px] text-[#555] leading-relaxed">
              ~30-90s. Pipeline: Apify screenshot → CSS deep tokenizer (parsed colors, fonts, vars, breakpoints, easing) → Claude Sonnet vision com tudo como contexto.
            </p>
          </>
        )}

        {existing && <BrandGuidelinesView guidelines={existing} />}
      </div>
    </section>
  );
}

function BrandGuidelinesView({ guidelines: g }: { guidelines: BrandGuidelines }) {
  const eg = g.extracted;
  const sourceUrl = g.source.type === "url" ? g.source.url : undefined;
  const quality = useMemo(() => computeQualityScore(eg), [eg]);
  const qBg =
    quality.score >= 70
      ? "bg-emerald-950/30 border-emerald-900/60"
      : quality.score >= 50
      ? "bg-amber-950/30 border-amber-900/60"
      : "bg-red-950/30 border-red-900/60";
  const qFill =
    quality.score >= 70 ? "bg-emerald-400" : quality.score >= 50 ? "bg-amber-400" : "bg-red-400";
  const qText =
    quality.score >= 70 ? "text-emerald-300" : quality.score >= 50 ? "text-amber-300" : "text-red-300";

  return (
    <div className="space-y-5 text-xs">
      <div className="text-[10px] text-[#666]">
        Source: {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener" className="underline hover:text-[#CCC]">{sourceUrl}</a> : "uploaded file"} · captured {new Date(g.capturedAt).toLocaleString("pt-PT")}
      </div>

      <div className={`border rounded p-3 ${qBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888]">Quality score</span>
          <span className={`font-mono font-bold ${qText}`}>{quality.score}/100</span>
        </div>
        <div className="h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${qFill}`} style={{ width: `${quality.score}%` }} />
        </div>
        {quality.flags.length > 0 && (
          <ul className="mt-3 space-y-0.5 text-[11px] text-[#CCC]">
            {quality.flags.map((f, i) => (
              <li key={i}>· {f}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Brand */}
      <Block title="Brand">
        <div className="space-y-1">
          <Row label="Name" value={eg.brand.name} />
          {eg.brand.tagline && <Row label="Tagline" value={eg.brand.tagline} />}
          {eg.brand.industry && <Row label="Industry" value={eg.brand.industry} />}
          {eg.brand.description && (
            <Row label="Description" value={<p className="text-[#CCC] leading-relaxed">{eg.brand.description}</p>} />
          )}
        </div>
      </Block>

      {/* Logo */}
      <Block title="Logo">
        <Row label="Style" value={<code className="font-mono">{eg.logo.style}</code>} />
        {eg.logo.distinctiveFeatures && (
          <Row label="Distinctive" value={<p className="text-[#CCC] leading-relaxed">{eg.logo.distinctiveFeatures}</p>} />
        )}
        {eg.logo.rules && eg.logo.rules.length > 0 && (
          <Row
            label="Rules"
            value={
              <ul className="space-y-0.5 text-[#CCC]">
                {eg.logo.rules.map((r, i) => (
                  <li key={i}>· {r}</li>
                ))}
              </ul>
            }
          />
        )}
      </Block>

      {/* Color System */}
      <Block title="Color System">
        <Row label="Mode" value={eg.colorSystem.isDarkFirst ? "dark-first" : "light-first"} />
        <Row label="Core" value={<ColorRow entries={eg.colorSystem.core} />} />
        {eg.colorSystem.accent.length > 0 && (
          <Row label="Accent" value={<ColorRow entries={eg.colorSystem.accent} />} />
        )}
        {eg.colorSystem.defaultPairing && (
          <Row label="Pairing" value={<p className="text-[#CCC] leading-relaxed">{eg.colorSystem.defaultPairing}</p>} />
        )}
      </Block>

      {/* Typography */}
      <Block title="Typography">
        {eg.typography.signature && (
          <Row label="Signature" value={<p className="text-[#CCC] leading-relaxed italic">{eg.typography.signature}</p>} />
        )}
        <Row
          label="Families"
          value={
            <ul className="space-y-1.5">
              {eg.typography.families.map((f) => (
                <li key={f.name} className="flex items-baseline justify-between gap-3">
                  <span className="text-[#EDEDED] font-mono">{f.name}</span>
                  <span className="text-[#666] font-mono text-[10px]">{f.classification} · {f.role}</span>
                </li>
              ))}
            </ul>
          }
        />
        <Row
          label="Scale"
          value={
            <ul className="space-y-0.5 font-mono text-[11px]">
              {Object.entries(eg.typography.scale).map(([k, v]) => v && (
                <li key={k} className="flex justify-between">
                  <span className="text-[#888]">{k}</span>
                  <span className="text-[#CCC]">
                    {v.fontSize} · lh {v.lineHeight}
                    {v.letterSpacing && ` · ls ${v.letterSpacing}`} · w {v.weight}
                  </span>
                </li>
              ))}
            </ul>
          }
        />
        {eg.typography.accentPattern && (
          <Row label="Accent" value={<p className="text-[#CCC] leading-relaxed">{eg.typography.accentPattern}</p>} />
        )}
      </Block>

      {/* Layout */}
      <Block title="Layout">
        <Row
          label="Container"
          value={<code className="font-mono">{eg.layout.container.maxWidth} · padding {eg.layout.container.horizontalPadding}</code>}
        />
        {eg.layout.breakpoints.length > 0 && (
          <Row
            label="Breakpoints"
            value={
              <ul className="space-y-0.5 font-mono text-[11px]">
                {eg.layout.breakpoints.map((b, i) => (
                  <li key={i} className="text-[#CCC]">
                    <span className="text-[#888]">{b.name}</span> {b.range}
                  </li>
                ))}
              </ul>
            }
          />
        )}
      </Block>

      {/* Design Principles */}
      {eg.designPrinciples.length > 0 && (
        <Block title="Design Principles">
          <ul className="space-y-3">
            {eg.designPrinciples.map((p) => (
              <li key={p.number}>
                <div className="flex items-baseline gap-3">
                  <span className="text-[#666] font-mono text-[11px] tabular-nums">{String(p.number).padStart(2, "0")}</span>
                  <span className="text-[#EDEDED] font-medium">{p.title}</span>
                </div>
                <p className="text-[#888] leading-relaxed mt-1 ml-6">{p.description}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* Section Archetypes */}
      {eg.sectionArchetypes.length > 0 && (
        <Block title="Section Archetypes">
          <ul className="space-y-1.5">
            {eg.sectionArchetypes.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666] w-20 flex-shrink-0">{s.type}</span>
                <span className="text-[#CCC] leading-relaxed">{s.description}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* Motion */}
      {(eg.motion.easing.length > 0 || eg.motion.signatureInteractions.length > 0) && (
        <Block title="Motion">
          {eg.motion.easing.length > 0 && (
            <Row
              label="Easing"
              value={
                <ul className="space-y-0.5 font-mono text-[11px]">
                  {eg.motion.easing.map((e, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#888] w-20">{e.name}</span>
                      <span className="text-[#CCC] truncate">{e.value}</span>
                    </li>
                  ))}
                </ul>
              }
            />
          )}
          {eg.motion.signatureInteractions.length > 0 && (
            <Row
              label="Signatures"
              value={
                <ul className="space-y-0.5">
                  {eg.motion.signatureInteractions.map((s, i) => (
                    <li key={i} className="text-[#CCC]">· {s}</li>
                  ))}
                </ul>
              }
            />
          )}
        </Block>
      )}

      {/* Summary */}
      <Block title="Summary">
        <p className="text-[#CCC] leading-relaxed italic">{eg.summary}</p>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-t border-[#1F1F1F] pt-3 first:border-t-0 first:pt-0">
      <summary className="cursor-pointer list-none flex items-center justify-between mb-2 text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] hover:text-[#EDEDED]">
        <span>{title}</span>
        <span className="group-open:rotate-45 transition-transform text-[12px]">+</span>
      </summary>
      <div className="space-y-2">{children}</div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666] w-20 flex-shrink-0 mt-0.5">{label}</span>
      <div className="flex-1 min-w-0 text-[#EDEDED]">{value}</div>
    </div>
  );
}

function ColorRow({ entries }: { entries: ColorEntry[] }) {
  return (
    <ul className="space-y-1.5">
      {entries.map((c) => (
        <li key={c.hex + c.name} className="flex items-center gap-3">
          <span className="w-5 h-5 rounded-sm border border-[#2A2A2A] flex-shrink-0" style={{ background: c.hex }} />
          <span className="text-[#EDEDED] font-mono text-[11px]">{c.name}</span>
          <span className="text-[#666] font-mono text-[10px]">{c.hex}</span>
          <span className="text-[#888] truncate text-[11px]">{c.usage}</span>
        </li>
      ))}
    </ul>
  );
}
