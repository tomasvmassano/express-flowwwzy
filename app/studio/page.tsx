"use client";

import { useMemo, useState } from "react";
import { useExtraction } from "./_lib/useExtraction";
import ReferenceCard from "./_lib/ReferenceCard";
import StudioForm, { DEFAULT_FORM, FormState } from "./_lib/StudioForm";
import MatchPanel from "./_lib/MatchPanel";
import type { MatchRequest, ReferenceDNA } from "@/lib/studio/types";

export default function StudioPage() {
  const ref1 = useExtraction("");
  const ref2 = useExtraction("");
  const ref3 = useExtraction("");
  const refs = [ref1, ref2, ref3];

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const completedRefs: ReferenceDNA[] = useMemo(
    () => refs.map((r) => r.state).filter((s) => s.status === "done" && s.dna).map((s) => s.dna!),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref1.state.status, ref2.state.status, ref3.state.status]
  );

  const matchRequest: MatchRequest | null =
    form.sections.length > 0 && completedRefs.length > 0
      ? { form, references: completedRefs }
      : null;

  const ready = !!matchRequest;

  const startAll = () => {
    refs.forEach((r) => {
      if (r.state.url && r.state.status === "idle") r.start();
    });
  };

  const anyRunning = refs.some((r) => r.state.status === "running");
  const anyIdleWithUrl = refs.some((r) => r.state.url && r.state.status === "idle");

  return (
    <div className="min-h-screen bg-black text-[#EDEDED]" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="border-b border-[#1F1F1F] sticky top-0 bg-black/95 backdrop-blur-sm z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <a href="/studio/projects" className="flex items-baseline gap-2 hover:opacity-80">
              <span className="font-bold tracking-tight text-base">Flowwwzy<span className="text-[#FAEBE3]">.</span></span>
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#666]">Studio</span>
            </a>
            <nav className="flex items-center gap-3 text-xs">
              <a href="/studio/projects" className="text-[#888] hover:text-[#EDEDED] transition-colors">
                Projects
              </a>
              <span className="text-[#EDEDED] font-medium">Sandbox</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/library"
              target="_blank"
              rel="noopener"
              className="text-xs text-[#888] hover:text-[#EDEDED] transition-colors"
            >
              View library →
            </a>
            <button
              onClick={async () => {
                await fetch("/api/studio/logout", { method: "POST" });
                window.location.href = "/studio/login";
              }}
              className="text-xs text-[#666] hover:text-[#EDEDED] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* 3-column layout on desktop, stacked on mobile/tablet */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr_400px] items-start">
          {/* ─── LEFT: Form ─── */}
          <aside className="lg:sticky lg:top-[72px]">
            <SectionHeader>Form</SectionHeader>
            <div className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] p-4">
              <StudioForm value={form} onChange={setForm} />
            </div>
          </aside>

          {/* ─── MIDDLE: References ─── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <SectionHeader noMargin>References</SectionHeader>
              <div className="flex items-center gap-2">
                {anyIdleWithUrl && (
                  <button
                    onClick={startAll}
                    disabled={anyRunning}
                    className="px-3 py-1.5 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 hover:bg-[#E0E0E0] transition-colors"
                  >
                    Extrair todas
                  </button>
                )}
                <span className="text-[10px] text-[#666] font-mono">
                  {completedRefs.length}/{refs.filter((r) => r.state.url).length || 0} done
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {refs.map((r, i) => (
                <ReferenceCard
                  key={i}
                  index={i}
                  state={r.state}
                  onUrlChange={r.setUrl}
                  onStart={r.start}
                  onReset={r.reset}
                />
              ))}
            </div>

            <p className="mt-4 text-[10px] text-[#555] font-mono">
              Pipeline: POST /api/studio/extract-reference → polling 3s → DNA + hints + match.
              Apify pode levar 10-240s por URL conforme complexidade do site.
            </p>
          </section>

          {/* ─── RIGHT: Match results ─── */}
          <aside className="lg:sticky lg:top-[72px]">
            <SectionHeader>Match</SectionHeader>
            <div className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] p-4">
              <MatchPanel request={matchRequest} ready={ready} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <h2
      className={`text-[10px] uppercase tracking-[0.16em] font-bold text-[#888] ${
        noMargin ? "" : "mb-3"
      }`}
    >
      {children}
    </h2>
  );
}
