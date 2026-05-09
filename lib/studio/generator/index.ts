/**
 * Generator orchestrator.
 *
 * Input:  a Project with an approved plan.
 * Output: a Map<path, content> representing a deployable Next.js project.
 *
 * The deployer (Vercel API) consumes the Map directly — each entry
 * becomes a file in the deployed project.
 */

import { LIBRARY } from "../library";
import {
  GITIGNORE,
  GLOBALS_CSS,
  NEXT_CONFIG,
  POSTCSS_CONFIG,
  README,
  TAILWIND_CONFIG,
  TSCONFIG,
  packageJsonFor,
} from "./templates";
import { composeLayout, composePage } from "./composer";
import {
  loadBlockSource,
  loadHelperSources,
  loadLibraryCss,
} from "./sourceLoader";
import type { Project } from "../project/types";

export type GeneratedFiles = Map<string, string>;

export class GenerateError extends Error {
  constructor(message: string, public reason?: string) {
    super(message);
  }
}

/**
 * Build a slug suitable for a Vercel project name.
 * Lowercase, alphanumeric + hyphens, max 52 chars (Vercel limit is 100).
 */
export function projectSlug(project: Project): string {
  const base = (project.form.business.name || "site")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || "site";
  // Append a 6-char suffix from project ID to avoid collisions.
  const idTail = project.id.replace(/^p_/, "").slice(-6);
  return `${base}-${idTail}`.slice(0, 52);
}

export async function generateProject(project: Project): Promise<GeneratedFiles> {
  if (!project.plan) {
    throw new GenerateError("Project has no plan. Approve a plan first.");
  }
  const plan = project.plan;
  if (!plan.sections || plan.sections.length === 0) {
    throw new GenerateError("Plan has no sections.");
  }

  const slug = projectSlug(project);
  const files: GeneratedFiles = new Map();

  // ─── Fixed templates ─────────────────────────────────────────────────
  files.set("package.json", packageJsonFor(project, slug));
  files.set("next.config.js", NEXT_CONFIG);
  files.set("tsconfig.json", TSCONFIG);
  files.set("tailwind.config.ts", TAILWIND_CONFIG);
  files.set("postcss.config.js", POSTCSS_CONFIG);
  files.set(".gitignore", GITIGNORE);
  files.set("README.md", README(project, slug));

  // ─── App shell ───────────────────────────────────────────────────────
  files.set("app/layout.tsx", composeLayout(project, plan));
  files.set("app/page.tsx", composePage(plan, LIBRARY));
  files.set("app/globals.css", GLOBALS_CSS);
  files.set("app/library.css", await loadLibraryCss());

  // ─── Library helpers (always copied) ─────────────────────────────────
  const helpers = await loadHelperSources();
  for (const [path, source] of Object.entries(helpers)) {
    files.set(path, source);
  }

  // ─── Library blocks (only those referenced in the plan) ──────────────
  const usedManifestIds = new Set(plan.sections.map((s) => s.manifestId));
  for (const manifest of LIBRARY) {
    if (!usedManifestIds.has(manifest.id)) continue;
    try {
      const source = await loadBlockSource(manifest.filePath);
      files.set(manifest.filePath, source);
    } catch (err) {
      throw new GenerateError(
        `Failed to load block "${manifest.id}" from ${manifest.filePath}`,
        String(err)
      );
    }
  }

  return files;
}

/** Diagnostic: count + total bytes for telemetry / response payloads. */
export function summarizeFiles(files: GeneratedFiles): { count: number; totalBytes: number } {
  let total = 0;
  for (const v of files.values()) {
    total += new TextEncoder().encode(v).length;
  }
  return { count: files.size, totalBytes: total };
}
