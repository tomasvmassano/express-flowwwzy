/**
 * Project storage layer — Upstash Redis on Vercel Marketplace.
 *
 * Why Redis (not Postgres) for V1:
 *   - Project records are small (~2-10KB) and we don't need joins.
 *   - State machine transitions are atomic and fit a key-value model.
 *   - Free tier (10k commands/day) is generous for our volume.
 *
 * If we later need rich queries (filter by tier, sort by date, full-text),
 * migrate to Postgres. The storage interface below is the only place that
 * would need to change — callers don't see Redis specifics.
 *
 * Keys:
 *   project:<id>          serialized Project JSON
 *   projects:by-state     ZSET of all project IDs scored by createdAt-ms
 *                          (so we can list newest-first without a SCAN)
 */

import { Redis } from "@upstash/redis";
import { Project, ProjectSchema, newProjectId } from "./types";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;

  // Vercel Marketplace integration injects KV_REST_API_URL/_TOKEN.
  // Direct Upstash dashboard uses UPSTASH_REDIS_REST_URL/_TOKEN.
  // Accept either so the user doesn't have to rename anything.
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_KV_REST_API_TOKEN;

  if (!url || !token) {
    const present = Object.keys(process.env)
      .filter((k) => /KV_|UPSTASH|REDIS|STORAGE/i.test(k))
      .sort();
    throw new Error(
      `Upstash Redis not configured. Need one of:
  - KV_REST_API_URL + KV_REST_API_TOKEN (Vercel Marketplace → Storage → Upstash Redis)
  - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (direct Upstash dashboard)

Storage-related env vars currently visible: ${present.length ? present.join(", ") : "(none)"}.

If you connected Upstash via Vercel's Marketplace and don't see KV_* vars, the database was likely created but not connected to the express-flowwwzy project — go to Vercel → Storage tab → click the database → Settings → Connected Projects → add express-flowwwzy. Then redeploy.`
    );
  }
  _redis = new Redis({ url, token });
  return _redis;
}

const PROJECT_KEY = (id: string) => `project:${id}`;
const PROJECTS_INDEX = "projects:by-date";

// ─── CRUD ──────────────────────────────────────────────────────────────

export async function createProject(
  partial: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    ...partial,
    id: newProjectId(),
    createdAt: now,
    updatedAt: now,
  };
  // Validate before write — surfaces shape errors at the boundary.
  const parsed = ProjectSchema.parse(project);
  const r = getRedis();
  await r.set(PROJECT_KEY(parsed.id), parsed);
  await r.zadd(PROJECTS_INDEX, { score: Date.parse(parsed.createdAt), member: parsed.id });
  return parsed;
}

export async function getProject(id: string): Promise<Project | null> {
  const r = getRedis();
  const raw = await r.get(PROJECT_KEY(id));
  if (!raw) return null;
  // Upstash deserializes JSON for us — but validate anyway in case of drift.
  const parsed = ProjectSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn("[storage] project failed schema validation", id, parsed.error.message);
    return null;
  }
  return parsed.data;
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, "id" | "createdAt">>
): Promise<Project | null> {
  const existing = await getProject(id);
  if (!existing) return null;
  const next: Project = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const parsed = ProjectSchema.parse(next);
  const r = getRedis();
  await r.set(PROJECT_KEY(parsed.id), parsed);
  return parsed;
}

export async function deleteProject(id: string): Promise<boolean> {
  const r = getRedis();
  const deleted = await r.del(PROJECT_KEY(id));
  await r.zrem(PROJECTS_INDEX, id);
  return deleted > 0;
}

/**
 * List projects newest-first. State filter optional.
 * Pagination via cursor (offset-based) — fine until we have thousands.
 */
export async function listProjects(opts: {
  limit?: number;
  offset?: number;
  state?: Project["state"];
} = {}): Promise<{ projects: Project[]; total: number }> {
  const { limit = 20, offset = 0, state } = opts;
  const r = getRedis();

  const total = await r.zcard(PROJECTS_INDEX);
  const ids = (await r.zrange(PROJECTS_INDEX, offset, offset + limit - 1, {
    rev: true,
  })) as string[];
  if (ids.length === 0) return { projects: [], total };

  // Fetch each project record. mget would be faster but ordering matters.
  const records = await Promise.all(ids.map((id) => getProject(id)));
  const projects = records.filter((p): p is Project => p !== null);
  return {
    projects: state ? projects.filter((p) => p.state === state) : projects,
    total,
  };
}
