"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import StateBadge from "../_lib/StateBadge";
import type { Project, ProjectReference, ProjectState } from "@/lib/studio/project/types";
import { canTransition } from "@/lib/studio/project/types";
import { COMPONENT_CATEGORIES, FORM_EXPOSED_MOODS, PALETTES } from "@/lib/studio/vocabulary";

const ALL_STATES: ProjectState[] = [
  "draft", "paid", "extracting", "ready_audit", "audited",
  "generating", "deployed", "delivered", "failed",
];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/studio/projects/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || `error ${res.status}`);
        return;
      }
      setProject(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(body: Partial<Project>) {
    if (!id) return null;
    setSaving(true);
    try {
      const res = await fetch(`/api/studio/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || data?.error || `error ${res.status}`);
        return null;
      }
      setProject(data);
      setError(null);
      return data as Project;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function transitionTo(state: ProjectState) {
    if (!project) return;
    if (!canTransition(project.state, state)) {
      setError(`Cannot transition from ${project.state} to ${state}`);
      return;
    }
    await patch({ state });
  }

  async function deleteProject() {
    if (!id) return;
    if (!confirm("Delete this project? Cannot be undone.")) return;
    await fetch(`/api/studio/projects/${id}`, { method: "DELETE" });
    router.push("/studio/projects");
  }

  return (
    <div className="min-h-screen bg-black text-[#EDEDED]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="border-b border-[#1F1F1F] sticky top-0 bg-black/95 backdrop-blur-sm z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/studio/projects" className="text-[#888] hover:text-[#EDEDED] text-xs">← Projects</Link>
            <span className="text-[#444]">/</span>
            <code className="text-[#EDEDED] font-mono text-xs truncate">{id}</code>
          </div>
          {project && <StateBadge state={project.state} />}
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {loading && !project && <p className="text-xs text-[#666]">Loading…</p>}
        {error && (
          <div className="mb-4 p-3 rounded border border-red-900 bg-red-950/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {project && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Main */}
            <div className="space-y-6 min-w-0">
              <Section title="Overview">
                <Grid>
                  <Field label="Tier" value={project.tier} />
                  <Field label="Created" value={new Date(project.createdAt).toLocaleString("pt-PT")} />
                  <Field label="Updated" value={new Date(project.updatedAt).toLocaleString("pt-PT")} />
                  <Field label="Payment" value={project.paymentRef || "—"} />
                  {project.deployedUrl && (
                    <Field label="Deployed" value={
                      <a href={project.deployedUrl} target="_blank" rel="noopener" className="text-[#FAFAFA] underline">
                        {project.deployedUrl}
                      </a>
                    } />
                  )}
                  {project.failureReason && <Field label="Failure" value={project.failureReason} />}
                </Grid>
              </Section>

              <FormSection project={project} onPatch={patch} saving={saving} />
              <ReferencesSection project={project} onPatch={patch} onReload={load} />
              <PlanSection project={project} />
            </div>

            {/* Right rail — actions */}
            <aside className="lg:sticky lg:top-[64px] self-start space-y-4">
              <div className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] p-4">
                <h3 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] mb-3">
                  State transition
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_STATES.map((s) => {
                    const allowed = canTransition(project.state, s);
                    const current = project.state === s;
                    return (
                      <button
                        key={s}
                        disabled={!allowed || current || saving}
                        onClick={() => transitionTo(s)}
                        className={`px-2 py-1.5 rounded text-[11px] border transition-colors ${
                          current
                            ? "bg-[#1A1A1A] text-[#EDEDED] border-[#666] cursor-default"
                            : allowed
                            ? "bg-transparent text-[#CCC] border-[#2A2A2A] hover:border-[#888]"
                            : "bg-transparent text-[#444] border-[#1F1F1F] cursor-not-allowed"
                        }`}
                      >
                        {current ? "● " : "  "}{s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-[#555] leading-relaxed">
                  Forward-only except <code>failed</code> can retry to any state.
                </p>
              </div>

              <GenerateBox project={project} onChange={load} />

              <div className="border border-red-950 rounded-lg bg-red-950/20 p-4">
                <h3 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-red-300 mb-3">
                  Danger zone
                </h3>
                <button
                  onClick={deleteProject}
                  className="w-full px-3 py-2 rounded bg-red-950 text-red-300 text-xs font-semibold border border-red-900 hover:bg-red-900/50 transition-colors"
                >
                  Delete project
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────

function FormSection({
  project,
  onPatch,
  saving,
}: {
  project: Project;
  onPatch: (b: Partial<Project>) => Promise<Project | null>;
  saving: boolean;
}) {
  const [form, setForm] = useState(project.form);

  // Keep local form in sync when remote project changes
  useEffect(() => setForm(project.form), [project.form]);

  const dirty = JSON.stringify(form) !== JSON.stringify(project.form);

  return (
    <Section
      title="Form"
      action={
        dirty && (
          <button
            onClick={() => onPatch({ form })}
            disabled={saving}
            className="px-2.5 py-1 rounded bg-[#FAFAFA] text-black text-[11px] font-semibold disabled:opacity-30"
          >
            {saving ? "..." : "Save"}
          </button>
        )
      }
    >
      <Grid>
        <Field
          label="Business name"
          value={
            <input
              className="input-row"
              value={form.business.name}
              onChange={(e) => setForm({ ...form, business: { ...form.business, name: e.target.value } })}
            />
          }
        />
        <Field
          label="Customer email"
          value={
            <input
              className="input-row"
              value={form.customer.email}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, email: e.target.value } })}
            />
          }
        />
        <Field
          label="Customer name"
          value={
            <input
              className="input-row"
              value={form.customer.name}
              onChange={(e) => setForm({ ...form, customer: { ...form.customer, name: e.target.value } })}
            />
          }
        />
        <Field
          label="What"
          value={
            <textarea
              rows={2}
              className="input-row resize-y min-h-[44px]"
              value={form.business.what}
              onChange={(e) => setForm({ ...form, business: { ...form.business, what: e.target.value } })}
            />
          }
        />
        <Field
          label="Differentiator"
          value={
            <textarea
              rows={2}
              className="input-row resize-y min-h-[44px]"
              value={form.business.differentiator}
              onChange={(e) => setForm({ ...form, business: { ...form.business, differentiator: e.target.value } })}
            />
          }
        />
        <Field
          label="Palette"
          value={
            <select
              className="input-row"
              value={form.paletteId}
              onChange={(e) => setForm({ ...form, paletteId: e.target.value })}
            >
              {Object.entries(PALETTES).map(([id, p]) => (
                <option key={id} value={id}>{p.name}</option>
              ))}
            </select>
          }
        />
        <Field
          label="Mood tags"
          value={
            <div className="flex flex-wrap gap-1">
              {FORM_EXPOSED_MOODS.map((m) => {
                const active = form.moodTags.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() =>
                      setForm({
                        ...form,
                        moodTags: active
                          ? form.moodTags.filter((x) => x !== m)
                          : [...form.moodTags, m],
                      })
                    }
                    className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                      active
                        ? "bg-[#FAFAFA] text-black border-[#FAFAFA]"
                        : "bg-transparent text-[#888] border-[#2A2A2A] hover:border-[#666]"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          }
        />
        <Field
          label="Sections"
          value={
            <div className="flex flex-wrap gap-1">
              {COMPONENT_CATEGORIES.map((c) => {
                const active = form.sections.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setForm({
                        ...form,
                        sections: active
                          ? form.sections.filter((x) => x !== c)
                          : [...form.sections, c],
                      })
                    }
                    className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
                      active
                        ? "bg-[#1A1A1A] text-[#EDEDED] border-[#666]"
                        : "bg-transparent text-[#666] border-[#2A2A2A] hover:border-[#444]"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          }
        />
      </Grid>

      <style jsx>{`
        .input-row {
          width: 100%;
          background: transparent;
          border: 1px solid #2A2A2A;
          border-radius: 6px;
          padding: 6px 10px;
          color: #EDEDED;
          font-size: 12px;
          font-family: inherit;
        }
        .input-row:focus {
          outline: none;
          border-color: #666;
        }
      `}</style>
    </Section>
  );
}

function ReferencesSection({
  project,
  onPatch,
  onReload,
}: {
  project: Project;
  onPatch: (b: Partial<Project>) => Promise<Project | null>;
  onReload: () => void;
}) {
  const [adding, setAdding] = useState("");

  async function addRef() {
    const url = adding.trim();
    if (!url || !/^https?:\/\//i.test(url)) return;
    const refs: ProjectReference[] = [...project.references, { url, status: "pending" }];
    await onPatch({ references: refs });
    setAdding("");
  }

  async function removeRef(idx: number) {
    const refs = project.references.filter((_, i) => i !== idx);
    await onPatch({ references: refs });
  }

  async function extractRef(idx: number) {
    const ref = project.references[idx];
    if (!ref || ref.status === "extracting") return;

    // Kick off
    const kickRes = await fetch("/api/studio/extract-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: ref.url }),
    });
    const kickData = await kickRes.json();

    if (kickData.status === "done" && kickData.dna) {
      const refs = [...project.references];
      refs[idx] = { ...ref, status: "done", dna: kickData.dna, hints: kickData.hints };
      await onPatch({ references: refs });
      return;
    }
    if (!kickData.jobId) {
      const refs = [...project.references];
      refs[idx] = { ...ref, status: "failed", error: kickData.error || "kickoff failed" };
      await onPatch({ references: refs });
      return;
    }

    // Mark as extracting and store jobId
    const startedRefs = [...project.references];
    startedRefs[idx] = { ...ref, status: "extracting", jobId: kickData.jobId };
    await onPatch({ references: startedRefs });

    // Poll
    let polls = 0;
    const maxPolls = 60; //  ~3 minutes at 3s intervals
    while (polls < maxPolls) {
      polls++;
      await new Promise((r) => setTimeout(r, 3000));
      const qs = new URLSearchParams({ jobId: kickData.jobId, url: ref.url });
      const pollRes = await fetch(`/api/studio/extract-reference?${qs.toString()}`, { cache: "no-store" });
      const pollData = await pollRes.json();

      if (pollData.status === "done") {
        const refs = [...startedRefs];
        refs[idx] = { ...ref, status: "done", jobId: kickData.jobId, dna: pollData.dna, hints: pollData.hints };
        await onPatch({ references: refs });
        return;
      }
      if (pollData.status === "failed") {
        const refs = [...startedRefs];
        refs[idx] = { ...ref, status: "failed", jobId: kickData.jobId, error: pollData.error };
        await onPatch({ references: refs });
        return;
      }
      // running: keep polling
    }

    // Timeout
    const refs = [...startedRefs];
    refs[idx] = { ...ref, status: "failed", jobId: kickData.jobId, error: "polling timed out" };
    await onPatch({ references: refs });
  }

  return (
    <Section title={`References (${project.references.length})`}>
      <ul className="space-y-2">
        {project.references.map((r, i) => (
          <li
            key={i}
            className="border border-[#2A2A2A] rounded p-3 flex items-start gap-3"
          >
            <span className="text-[10px] font-mono text-[#666] w-5 flex-shrink-0 mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <a
                href={r.url}
                target="_blank"
                rel="noopener"
                className="text-xs text-[#EDEDED] hover:text-[#FAFAFA] truncate block"
              >
                {r.url}
              </a>
              <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                <RefStatus status={r.status} error={r.error} />
                {r.dna && (
                  <span className="text-[#666] font-mono truncate">
                    {r.dna.moodTags.slice(0, 3).join(", ")}
                  </span>
                )}
                {r.hints?.declaredFonts && r.hints.declaredFonts.length > 0 && (
                  <span className="text-[#888] font-mono truncate">
                    {r.hints.declaredFonts.slice(0, 3).join(", ")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {(r.status === "pending" || r.status === "failed") && (
                <button
                  onClick={() => extractRef(i)}
                  className="px-2 py-1 rounded bg-[#FAFAFA] text-black text-[10px] font-semibold hover:bg-[#E0E0E0]"
                >
                  Extract
                </button>
              )}
              <button
                onClick={() => removeRef(i)}
                className="px-1.5 py-1 rounded text-[#666] hover:text-red-400 text-[11px]"
                title="Remove"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          type="url"
          placeholder="https://example.com"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRef()}
          className="flex-1 bg-transparent border border-[#2A2A2A] rounded px-3 py-2 text-xs text-[#EDEDED] placeholder:text-[#444] focus:outline-none focus:border-[#666]"
        />
        <button
          onClick={addRef}
          disabled={!adding}
          className="px-3 py-2 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#EDEDED] text-xs disabled:opacity-30 hover:border-[#444]"
        >
          Add
        </button>
      </div>
    </Section>
  );
}

function GenerateBox({ project, onChange }: { project: Project; onChange: () => void }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ deployedUrl?: string; inspectorUrl?: string; error?: string } | null>(null);
  const ready = project.state === "audited" || project.state === "failed";
  const hasPlan = !!project.plan && project.plan.sections.length > 0;

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/studio/projects/${project.id}/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data?.message || data?.error || `error ${res.status}` });
        return;
      }
      setResult({ deployedUrl: data.deployedUrl, inspectorUrl: data.inspectorUrl });
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setRunning(false);
      onChange();
    }
  }

  return (
    <div className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] p-4">
      <h3 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] mb-3">Generate</h3>
      {!hasPlan && <p className="text-[11px] text-[#666] mb-3">No plan yet — define one before generating.</p>}
      {hasPlan && !ready && (
        <p className="text-[11px] text-[#666] mb-3">Project must be in state <code>audited</code> to generate. Current: <code>{project.state}</code>.</p>
      )}
      <button
        onClick={run}
        disabled={!hasPlan || !ready || running}
        className="w-full px-3 py-2 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
      >
        {running ? "Generating + deploying…" : "Generate & deploy"}
      </button>
      {result?.deployedUrl && (
        <div className="mt-3 p-2 rounded bg-emerald-950/40 text-emerald-300 text-[11px]">
          ✓ Deployed: <a href={result.deployedUrl} target="_blank" rel="noopener" className="underline">{result.deployedUrl}</a>
          {result.inspectorUrl && (
            <> · <a href={result.inspectorUrl} target="_blank" rel="noopener" className="underline">inspector</a></>
          )}
        </div>
      )}
      {result?.error && (
        <div className="mt-3 p-2 rounded bg-red-950/40 text-red-300 text-[11px] break-words">
          {result.error}
        </div>
      )}
      <p className="mt-3 text-[10px] text-[#555] leading-relaxed">
        Generates the project files, deploys to your Vercel account, returns URL.
        Build typically completes in 30-90s.
      </p>
    </div>
  );
}

function PlanSection({ project }: { project: Project }) {
  if (!project.plan) {
    return (
      <Section title="Plan">
        <div className="text-xs text-[#666] py-2">
          No plan yet. The AI proposer (V3) will populate this once references are extracted and form is complete.
          For V1, you can manually compose the plan via the matcher in Sandbox.
        </div>
      </Section>
    );
  }
  return (
    <Section title="Plan">
      <div className="text-xs text-[#CCC] space-y-2">
        <div className="flex gap-3 flex-wrap">
          <span className="text-[#888]">paletteId:</span> <code className="font-mono">{project.plan.paletteId}</code>
          <span className="text-[#888]">fontPair:</span> <code className="font-mono">{project.plan.fontPair}</code>
        </div>
        <ul className="space-y-1 mt-2">
          {project.plan.sections.map((s, i) => (
            <li key={i} className="font-mono text-[11px]">
              <span className="text-[#666]">{s.category}</span> → <span className="text-[#EDEDED]">{s.manifestId}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-[#2A2A2A] rounded-lg bg-[#0F0F0F] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1F1F1F] bg-[#0A0A0A] flex items-center justify-between gap-3">
        <h2 className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888]">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666] w-28 flex-shrink-0 mt-1.5">
        {label}
      </span>
      <div className="flex-1 min-w-0 text-xs text-[#EDEDED]">{value}</div>
    </div>
  );
}

function RefStatus({ status, error }: { status: ProjectReference["status"]; error?: string }) {
  const map: Record<ProjectReference["status"], { color: string; label: string }> = {
    pending: { color: "text-[#666]", label: "pending" },
    extracting: { color: "text-amber-400", label: "extracting…" },
    done: { color: "text-emerald-400", label: "done" },
    failed: { color: "text-red-400", label: "failed" },
  };
  const m = map[status];
  return (
    <span className={`${m.color} text-[11px]`} title={error || ""}>
      ● {m.label}
    </span>
  );
}
