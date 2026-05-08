/**
 * In-memory cache keyed by URL hash.
 *
 * TODO (production): swap for Vercel KV or Postgres. The current cache only
 * survives within a single warm Vercel function invocation. Cold starts
 * lose it. Acceptable while the catalog of references is small (< ~30
 * URLs/day). When traffic ramps, move to a persistent store keyed by the
 * same URL hash so we never pay for the same screenshot twice.
 */

import { ReferenceDNA } from "../types";

const cache = new Map<string, { value: ReferenceDNA; expires: number }>();
const TTL_MS = 1000 * 60 * 60 * 24 * 14; //  14 days

function hash(url: string): string {
  // Cheap deterministic hash. djb2.
  let h = 5381;
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function getCached(url: string): ReferenceDNA | null {
  const k = hash(url);
  const entry = cache.get(k);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cache.delete(k);
    return null;
  }
  return entry.value;
}

export function setCached(url: string, value: ReferenceDNA): void {
  cache.set(hash(url), { value, expires: Date.now() + TTL_MS });
}

export function cacheStats(): { size: number } {
  return { size: cache.size };
}
