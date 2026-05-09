"use client";

import { useState } from "react";
import type { MatchRequest, MatchResponse } from "@/lib/studio/types";

type Props = {
  request: MatchRequest | null;
  /** Whether the request is ready (form complete + at least one ref done) */
  ready: boolean;
};

export default function MatchPanel({ request, ready }: Props) {
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runMatch() {
    if (!request) return;
    setRunning(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/studio/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || `match failed (${res.status})`);
        return;
      }
      setResponse(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  const sections = response ? Object.entries(response.picks) : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#EDEDED]">Matched picks</h3>
        <button
          onClick={runMatch}
          disabled={!ready || running}
          className="px-3 py-1.5 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
        >
          {running ? "A correr..." : "Match library"}
        </button>
      </div>

      {!ready && (
        <p className="text-[#666] text-xs">
          Precisa de pelo menos 1 referência extraída + secções escolhidas no form.
        </p>
      )}

      {error && (
        <div className="text-xs text-red-400 border border-red-900 rounded p-3 bg-red-950/30">
          {error}
        </div>
      )}

      {response && sections.length === 0 && (
        <p className="text-[#666] text-xs">Sem secções pedidas no form.</p>
      )}

      {response && sections.length > 0 && (
        <div className="space-y-3">
          {sections.map(([section, picks]) => (
            <SectionResult
              key={section}
              section={section}
              picks={picks as MatchResponse["picks"][keyof MatchResponse["picks"]]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionResult({
  section,
  picks,
}: {
  section: string;
  picks: MatchResponse["picks"][keyof MatchResponse["picks"]];
}) {
  return (
    <div className="border border-[#2A2A2A] rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-[#0F0F0F] border-b border-[#1F1F1F] flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888]">
          {section}
        </span>
        <span className="text-[10px] text-[#666] font-mono">
          {picks?.length || 0} picks
        </span>
      </div>
      {(!picks || picks.length === 0) ? (
        <div className="px-3 py-4 text-xs text-[#666]">
          Nenhum bloco da library passou o hard filter de mood.
        </div>
      ) : (
        <ul className="divide-y divide-[#1F1F1F]">
          {picks.map((p, idx) => (
            <li key={p.manifestId} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-[#666] tabular-nums w-4 flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`/library#${p.manifestId}`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs font-mono text-[#EDEDED] truncate hover:text-[#FAFAFA] hover:underline"
                  >
                    {p.manifestId}
                  </a>
                </div>
                <ScoreBar score={p.score} />
              </div>
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[10px] text-[#666] hover:text-[#888] list-none">
                  reasons ({p.reasons.length})
                </summary>
                <ul className="mt-1.5 ml-6 space-y-0.5 text-[11px] text-[#888]">
                  {p.reasons.map((r, i) => (
                    <li key={i} className="font-mono">{r}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? "#4ade80" : score >= 0.5 ? "#FAFAFA" : "#666";
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="w-20 h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span
        className="text-[10px] font-mono tabular-nums w-8 text-right"
        style={{ color }}
      >
        {score.toFixed(2)}
      </span>
    </div>
  );
}
