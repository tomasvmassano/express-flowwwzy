/**
 * Screenshot capture via Apify, split into kick-off + poll phases.
 *
 * The original single-shot `run-sync` flow blocks the calling Vercel
 * function until Apify finishes — for premium portfolio sites that
 * routinely takes 60-240s, well past the hobby tier's 60s ceiling.
 *
 * Async flow:
 *   1. kickOffScreenshot(url) → starts an Apify run, returns runId.
 *      Fast (~1-3s, just the API call).
 *   2. pollScreenshot(runId) → checks Apify status. If still running,
 *      returns immediately. If SUCCEEDED, fetches the screenshot from
 *      Apify's KV store and resizes via sharp, returns the buffer.
 *      Failure cases return a typed error.
 *
 * Each individual call fits comfortably in 60s. The orchestration
 * (when to poll, how often) lives outside this module — typically
 * the client polls the API route every few seconds.
 */

import sharp from "sharp";

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "apify~screenshot-url";

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 82;

export type Screenshot = {
  buffer: Buffer;
  contentType: "image/jpeg";
  apifyUrl: string;
  dimensions: { width: number; height: number };
  byteSize: number;
};

export type PollResult =
  | { status: "running"; elapsedMs: number }
  | { status: "succeeded"; screenshot: Screenshot; runDurationMs: number }
  | { status: "failed"; error: string; apifyStatus?: string };

// ─────────────────────────────────────────────────────────────────────────
// Phase 1 — kick off
// ─────────────────────────────────────────────────────────────────────────

export async function kickOffScreenshot(url: string): Promise<{ runId: string }> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN is not set in env vars");

  const res = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${token}&memory=2048&timeout=180`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: [{ url }],
        format: "png",
        waitUntil: "networkidle2",
        delay: 3000,
        viewportWidth: 1440,
        scrollToBottom: false,
      }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apify kickoff failed: ${res.status} ${text.slice(0, 240)}`);
  }
  const json = await res.json();
  const runId: string | undefined = json?.data?.id;
  if (!runId) throw new Error("Apify response missing run.id");
  return { runId };
}

// ─────────────────────────────────────────────────────────────────────────
// Phase 2 — poll
// ─────────────────────────────────────────────────────────────────────────

export async function pollScreenshot(runId: string): Promise<PollResult> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN is not set");

  const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
  if (!statusRes.ok) {
    return { status: "failed", error: `Status check failed: ${statusRes.status}` };
  }
  const { data } = await statusRes.json();

  const startedAtMs = data?.startedAt ? new Date(data.startedAt).getTime() : Date.now();
  const elapsedMs = Date.now() - startedAtMs;
  const apifyStatus: string = data?.status || "UNKNOWN";

  if (apifyStatus === "READY" || apifyStatus === "RUNNING") {
    return { status: "running", elapsedMs };
  }
  if (apifyStatus !== "SUCCEEDED") {
    return {
      status: "failed",
      error: `Apify run ended in status ${apifyStatus}`,
      apifyStatus,
    };
  }

  // SUCCEEDED — fetch the screenshot record from the run's KV store.
  const storeId: string | undefined = data?.defaultKeyValueStoreId;
  if (!storeId) {
    return { status: "failed", error: "Apify run had no defaultKeyValueStoreId" };
  }

  const keysRes = await fetch(
    `${APIFY_BASE}/key-value-stores/${storeId}/keys?token=${token}&limit=10`
  );
  if (!keysRes.ok) {
    return { status: "failed", error: `KV keys fetch failed: ${keysRes.status}` };
  }
  const keysData = await keysRes.json();
  const items: { key: string }[] = keysData?.data?.items || [];
  const imgKey = items.find((k) => k.key.endsWith(".png") || /screenshot/i.test(k.key))?.key;
  if (!imgKey) {
    return {
      status: "failed",
      error: `No screenshot key in KV store. Keys: ${items.map((i) => i.key).join(", ")}`,
    };
  }

  const imgUrl = `${APIFY_BASE}/key-value-stores/${storeId}/records/${imgKey}?token=${token}`;
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) {
    return { status: "failed", error: `Screenshot fetch failed: ${imgRes.status}` };
  }
  const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

  // Resize + recompress so vision API never gets oversized inputs.
  const pipeline = sharp(rawBuffer).resize({
    width: MAX_EDGE_PX,
    height: MAX_EDGE_PX,
    fit: "inside",
    withoutEnlargement: true,
  });
  const resized = await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true }).toBuffer();
  const meta = await sharp(resized).metadata();

  return {
    status: "succeeded",
    runDurationMs: data?.stats?.durationMillis ?? elapsedMs,
    screenshot: {
      buffer: resized,
      contentType: "image/jpeg",
      apifyUrl: imgUrl,
      dimensions: { width: meta.width || 0, height: meta.height || 0 },
      byteSize: resized.length,
    },
  };
}
