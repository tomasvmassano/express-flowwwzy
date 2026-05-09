/**
 * KV-backed cache for slow extractor results (brand guidelines + ref DNA).
 *
 * The previous in-memory cache died on cold starts. Vercel hobby tier
 * functions cap at 60s, so the brand-guidelines pipeline (Apify
 * screenshot done → HTML fetch → CSS tokenizer → Claude vision) can
 * occasionally exceed the budget and the request returns a 504 HTML
 * page. Without persistence, the next poll re-runs everything and
 * times out again.
 *
 * KV cache fixes that: once the heavy work completes (even if the
 * outer request timed out before responding), the result is written
 * to KV and the next poll reads it back instantly.
 *
 * Key shape:  cache:<scope>:<urlHash>
 * TTL:        7 days (re-extracts allowed manually anytime)
 */

import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; //  graceful: skip caching when not configured
  _redis = new Redis({ url, token });
  return _redis;
}

const TTL_SECONDS = 7 * 24 * 60 * 60;

function urlHash(url: string): string {
  // Cheap deterministic hash. djb2.
  let h = 5381;
  for (let i = 0; i < url.length; i++) h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function key(scope: string, url: string): string {
  return `cache:${scope}:${urlHash(url)}`;
}

export async function persistGet<T>(scope: string, url: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const raw = await r.get(key(scope, url));
    return (raw as T) ?? null;
  } catch {
    return null;
  }
}

export async function persistSet<T>(scope: string, url: string, value: T): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key(scope, url), value, { ex: TTL_SECONDS });
  } catch {
    /* never fail the caller because of cache write */
  }
}
