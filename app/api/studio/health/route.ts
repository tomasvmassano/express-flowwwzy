import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint — shows which env vars are present without exposing
 * their values. Lets the operator self-check the Studio is wired correctly
 * after Vercel env-var changes.
 *
 * Gated by the same auth middleware as the rest of /api/studio/* —
 * not safe to leave open since it leaks the var-name shape of the runtime.
 */
export async function GET() {
  const checks = {
    storage: {
      configured: !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
      via: process.env.KV_REST_API_URL
        ? "KV_*"
        : process.env.UPSTASH_REDIS_REST_URL
        ? "UPSTASH_REDIS_*"
        : null,
      expectedKeys: [
        "KV_REST_API_URL + KV_REST_API_TOKEN",
        "UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
      ],
    },
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      keyPrefix: process.env.ANTHROPIC_API_KEY?.slice(0, 8) || null,
    },
    apify: {
      configured: !!process.env.APIFY_API_TOKEN,
      keyPrefix: process.env.APIFY_API_TOKEN?.slice(0, 12) || null,
    },
    vercel_deploy: {
      configured: !!process.env.VERCEL_API_TOKEN,
    },
    resend: {
      configured: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || "(not set — defaults to onboarding@resend.dev)",
    },
    auth: {
      passwordConfigured: !!process.env.STUDIO_PASSWORD && process.env.STUDIO_PASSWORD.length >= 6,
      secretConfigured: !!process.env.STUDIO_AUTH_SECRET && process.env.STUDIO_AUTH_SECRET.length >= 16,
    },
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || null,
      region: process.env.VERCEL_REGION || null,
    },
  };

  // List storage-adjacent env var NAMES (not values) for debug.
  const storageKeys = Object.keys(process.env)
    .filter((k) => /KV_|UPSTASH|REDIS|STORAGE/i.test(k))
    .sort();

  return NextResponse.json({
    ok: checks.storage.configured && checks.anthropic.configured && checks.apify.configured,
    checks,
    storageEnvVarsPresent: storageKeys,
  });
}
