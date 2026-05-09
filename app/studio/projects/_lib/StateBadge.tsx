"use client";

import type { ProjectState } from "@/lib/studio/project/types";

const STYLES: Record<ProjectState, { bg: string; text: string; dot: string; label: string }> = {
  draft: { bg: "bg-[#1A1A1A]", text: "text-[#888]", dot: "bg-[#666]", label: "Draft" },
  paid: { bg: "bg-blue-950/40", text: "text-blue-300", dot: "bg-blue-400", label: "Paid" },
  extracting: { bg: "bg-amber-950/40", text: "text-amber-300", dot: "bg-amber-400 animate-pulse", label: "Extracting" },
  ready_audit: { bg: "bg-purple-950/40", text: "text-purple-300", dot: "bg-purple-400", label: "Ready audit" },
  audited: { bg: "bg-emerald-950/40", text: "text-emerald-300", dot: "bg-emerald-400", label: "Audited" },
  generating: { bg: "bg-amber-950/40", text: "text-amber-300", dot: "bg-amber-400 animate-pulse", label: "Generating" },
  deployed: { bg: "bg-emerald-950/40", text: "text-emerald-300", dot: "bg-emerald-400", label: "Deployed" },
  delivered: { bg: "bg-emerald-900/40", text: "text-emerald-200", dot: "bg-emerald-300", label: "Delivered ✓" },
  failed: { bg: "bg-red-950/40", text: "text-red-300", dot: "bg-red-400", label: "Failed" },
};

export default function StateBadge({ state }: { state: ProjectState }) {
  const s = STYLES[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.12em] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
