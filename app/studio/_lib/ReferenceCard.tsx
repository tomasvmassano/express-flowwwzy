"use client";

import type { ExtractionState } from "./useExtraction";

type Props = {
  index: number;
  state: ExtractionState;
  onUrlChange: (url: string) => void;
  onStart: () => void;
  onReset: () => void;
};

export default function ReferenceCard({ index, state, onUrlChange, onStart, onReset }: Props) {
  const isRunning = state.status === "running";
  const isDone = state.status === "done";
  const isFailed = state.status === "failed";

  const elapsedSec = state.apifyElapsedMs ? Math.round(state.apifyElapsedMs / 1000) : 0;

  return (
    <div className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F]">
      {/* URL input row */}
      <div className="flex items-center gap-2 p-3 border-b border-[#1F1F1F]">
        <span className="font-mono text-[10px] text-[#666] w-5 flex-shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <input
          type="url"
          inputMode="url"
          placeholder="https://exemplo.com"
          value={state.url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isRunning}
          className="flex-1 bg-transparent border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#EDEDED] placeholder:text-[#444] focus:outline-none focus:border-[#666] disabled:opacity-50"
        />
        {!isRunning && !isDone && (
          <button
            onClick={onStart}
            disabled={!state.url}
            className="px-3 py-2 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
          >
            Extrair
          </button>
        )}
        {(isRunning || isDone || isFailed) && (
          <button
            onClick={onReset}
            className="px-2 py-2 rounded text-[#888] text-xs hover:text-[#EDEDED] hover:bg-[#1F1F1F] transition-colors"
            title="Reset"
          >
            ↺
          </button>
        )}
      </div>

      {/* Status / output area */}
      {isRunning && (
        <div className="p-3 flex items-center gap-3 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[#EDEDED]">A correr no Apify…</span>
          <span className="text-[#666] ml-auto tabular-nums">{elapsedSec}s</span>
        </div>
      )}

      {isFailed && (
        <div className="p-3 text-xs">
          <div className="flex items-center gap-2 text-red-400">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
            <span>Falhou</span>
          </div>
          <pre className="mt-2 text-[#888] whitespace-pre-wrap break-words font-mono text-[11px]">
            {state.error}
          </pre>
        </div>
      )}

      {isDone && state.dna && (
        <div className="p-3 space-y-3 text-xs">
          {/* Mood + palette swatch */}
          <Row label="Mood">
            <div className="flex flex-wrap gap-1">
              {state.dna.moodTags.map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] text-[10px]"
                >
                  {m}
                </span>
              ))}
            </div>
          </Row>

          <Row label="Palette">
            <div className="flex items-center gap-1">
              {state.dna.palette.dominantHex.map((c) => (
                <span
                  key={c}
                  title={c}
                  className="w-5 h-5 rounded-sm border border-[#2A2A2A]"
                  style={{ background: c }}
                />
              ))}
              <span className="text-[#666] ml-2 font-mono">
                {state.dna.palette.isDarkMode ? "dark" : "light"}
              </span>
            </div>
          </Row>

          <Row label="Type">
            <span className="font-mono text-[#CCC]">
              {state.dna.typography.primary}
              <span className="text-[#666]"> · {state.dna.typography.feel}</span>
              <span className="text-[#666]"> · exp {state.dna.typography.expressiveness}</span>
            </span>
          </Row>

          <Row label="Tone">
            <span className="font-mono text-[#CCC]">
              prof {state.dna.tone.profCasual}
              <span className="text-[#666]"> · </span>
              bold {state.dna.tone.calmBold}
              <span className="text-[#666]"> · </span>
              modern {state.dna.tone.classicModern}
            </span>
          </Row>

          <Row label="Layout">
            <span className="font-mono text-[#CCC]">
              {state.dna.density}
              <span className="text-[#666]"> · </span>
              {state.dna.alignment}
              <span className="text-[#666]"> · </span>
              imagery {state.dna.imagery.style}
            </span>
          </Row>

          {state.hints && state.hints.declaredFonts.length > 0 && (
            <Row label="Fonts (HTML)">
              <span className="font-mono text-[#9CA3AF] text-[11px]">
                {state.hints.declaredFonts.join(", ")}
              </span>
            </Row>
          )}

          {state.dna.summary && (
            <details className="text-[#888]">
              <summary className="cursor-pointer hover:text-[#EDEDED] text-[11px]">
                Summary
              </summary>
              <p className="mt-2 leading-relaxed text-[#CCC]">{state.dna.summary}</p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666] w-20 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
