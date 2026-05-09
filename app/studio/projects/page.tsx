"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StateBadge from "./_lib/StateBadge";
import type { Project, ProjectState } from "@/lib/studio/project/types";

const STATES_FILTER: (ProjectState | "all")[] = [
  "all",
  "draft",
  "paid",
  "extracting",
  "ready_audit",
  "audited",
  "deployed",
  "failed",
];

export default function ProjectsQueuePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectState | "all">("all");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "50" });
      if (filter !== "all") qs.set("state", filter);
      const res = await fetch(`/api/studio/projects?${qs.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || `error ${res.status}`);
        setProjects([]);
        setTotal(0);
        return;
      }
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function createProject() {
    setCreating(true);
    try {
      const res = await fetch("/api/studio/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "site" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || `create failed`);
        setCreating(false);
        return;
      }
      router.push(`/studio/projects/${data.id}`);
    } catch (e) {
      setError(String(e));
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#EDEDED]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <Header onSignOut={async () => {
        await fetch("/api/studio/logout", { method: "POST" });
        window.location.href = "/studio/login";
      }} />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {/* Title + create */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-base font-semibold">Projects</h1>
            <p className="text-xs text-[#666] mt-0.5">
              {total} total · {projects.length} loaded
            </p>
          </div>
          <button
            onClick={createProject}
            disabled={creating}
            className="px-3 py-2 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 hover:bg-[#E0E0E0] transition-colors"
          >
            {creating ? "..." : "+ New project"}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {STATES_FILTER.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.1em] font-semibold border transition-colors ${
                filter === s
                  ? "bg-[#1A1A1A] text-[#EDEDED] border-[#666]"
                  : "bg-transparent text-[#666] border-[#2A2A2A] hover:border-[#444]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded border border-red-900 bg-red-950/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="border border-[#2A2A2A] rounded-lg overflow-hidden bg-[#0F0F0F]">
          <div className="grid grid-cols-[120px_60px_1fr_140px_80px_120px] gap-3 px-4 py-2.5 border-b border-[#1F1F1F] bg-[#0A0A0A] text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666]">
            <span>ID</span>
            <span>Tier</span>
            <span>Customer / Business</span>
            <span>State</span>
            <span>Refs</span>
            <span>Created</span>
          </div>

          {loading && projects.length === 0 ? (
            <Empty>Loading…</Empty>
          ) : projects.length === 0 ? (
            <Empty>
              {filter === "all"
                ? 'No projects yet. Click "New project" to create a draft.'
                : `No projects in state "${filter}".`}
            </Empty>
          ) : (
            <ul className="divide-y divide-[#1F1F1F]">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/studio/projects/${p.id}`}
                    className="grid grid-cols-[120px_60px_1fr_140px_80px_120px] gap-3 px-4 py-3 items-center hover:bg-[#161616] transition-colors text-xs"
                  >
                    <code className="text-[#888] truncate font-mono text-[11px]">{p.id}</code>
                    <span className="text-[#CCC]">{p.tier}</span>
                    <div className="min-w-0">
                      <div className="text-[#EDEDED] truncate">
                        {p.form.business.name || <span className="text-[#555] italic">— no business —</span>}
                      </div>
                      <div className="text-[#666] truncate text-[11px] mt-0.5">
                        {p.form.customer.email || p.form.customer.name || <span className="italic">— no customer —</span>}
                      </div>
                    </div>
                    <StateBadge state={p.state} />
                    <span className="text-[#888] tabular-nums font-mono text-[11px]">
                      {p.references.filter((r) => r.status === "done").length}/{p.references.length || "—"}
                    </span>
                    <span className="text-[#666] text-[11px] tabular-nums">{relativeTime(p.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-3 text-[10px] text-[#555] font-mono">
          GET /api/studio/projects · refresh: <button onClick={load} className="text-[#888] hover:text-[#CCC] underline">reload</button> · debug: <a href="/api/studio/health" target="_blank" rel="noopener" className="text-[#888] hover:text-[#CCC] underline">health</a>
        </p>
      </main>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-12 text-center text-xs text-[#666]">
      {children}
    </div>
  );
}

function Header({ onSignOut }: { onSignOut: () => void }) {
  return (
    <header className="border-b border-[#1F1F1F] sticky top-0 bg-black/95 backdrop-blur-sm z-30">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/studio/projects" className="flex items-baseline gap-2 hover:opacity-80">
            <span className="font-bold tracking-tight text-base">
              Flowwwzy<span className="text-[#FAEBE3]">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#666]">Studio</span>
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/studio/projects" className="text-[#EDEDED] font-medium">
              Projects
            </Link>
            <Link href="/studio" className="text-[#888] hover:text-[#EDEDED] transition-colors">
              Sandbox
            </Link>
            <Link href="/library" target="_blank" rel="noopener" className="text-[#666] hover:text-[#EDEDED] transition-colors">
              Library →
            </Link>
          </nav>
        </div>
        <button
          onClick={onSignOut}
          className="text-xs text-[#666] hover:text-[#EDEDED] transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function relativeTime(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (ms < 60_000) return "now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  if (ms < 7 * 86_400_000) return `${Math.floor(ms / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}
