/**
 * Screenshot capture via Apify (apify/screenshot-url actor).
 *
 * Returns the screenshot as a Buffer + content type. The matcher and
 * analyzer never see Apify-specific shapes; if we swap providers later,
 * only this file changes.
 *
 * The actor produces full-page renders that often exceed Claude vision's
 * 5MB limit (e.g. studio-mcgee.com came back at 7950×8827, 5.4MB). We
 * resize down to a max edge of 1600px and convert to JPEG before
 * returning, which gives Claude all the visual detail it needs while
 * staying comfortably under the API limit.
 */

import sharp from "sharp";

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "apify~screenshot-url";

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 82;

export type Screenshot = {
  buffer: Buffer;
  /** After resize the output is JPEG (smaller, still high quality for vision) */
  contentType: "image/jpeg";
  /** Where the screenshot lives in Apify's KV store — kept for cache/debug */
  apifyUrl: string;
  /** Final dimensions after resize, for logging/audit */
  dimensions: { width: number; height: number };
  /** Final byte size after resize */
  byteSize: number;
};

export async function takeScreenshot(url: string): Promise<Screenshot> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set in env vars");
  }

  // 1) Run the actor synchronously. ~5-15s for typical sites; up to 60s for
  // premium portfolios with heavy entrance animations.
  // - waitUntil: networkidle2 → wait until network has been idle for 500ms.
  //   Necessary for SPA sites whose content loads after `load` fires.
  // - delay: 3000 → extra grace for CSS animations finishing their entrance.
  //   Charlie Horner / Dan Fink style sites need this; cheaper sites are fine.
  // - memory: 2048 → faster headless render. Free tier ceiling per run.
  const runRes = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync?token=${token}&memory=2048&timeout=90`,
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
  if (!runRes.ok) {
    const text = await runRes.text().catch(() => "");
    throw new Error(`Apify run failed: ${runRes.status} ${text.slice(0, 240)}`);
  }
  const run = await runRes.json();
  const storeId: string | undefined = run?.data?.defaultKeyValueStoreId;
  if (!storeId) throw new Error("Apify run produced no defaultKeyValueStoreId");

  // 2) Find the screenshot record in the run's KV store.
  const keysRes = await fetch(
    `${APIFY_BASE}/key-value-stores/${storeId}/keys?token=${token}&limit=10`
  );
  if (!keysRes.ok) throw new Error(`KV keys fetch failed: ${keysRes.status}`);
  const keysData = await keysRes.json();
  const items: { key: string }[] = keysData?.data?.items || [];
  const imgKey = items.find((k) => k.key.endsWith(".png") || /screenshot/i.test(k.key))?.key;
  if (!imgKey) {
    throw new Error(`No screenshot key in KV store. Found: ${items.map((i) => i.key).join(", ")}`);
  }

  // 3) Pull the bytes.
  const imgUrl = `${APIFY_BASE}/key-value-stores/${storeId}/records/${imgKey}?token=${token}`;
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error(`Screenshot fetch failed: ${imgRes.status}`);
  const rawBuffer = Buffer.from(await imgRes.arrayBuffer());

  // 4) Resize + recompress so vision API never gets oversized inputs.
  const pipeline = sharp(rawBuffer).resize({
    width: MAX_EDGE_PX,
    height: MAX_EDGE_PX,
    fit: "inside",
    withoutEnlargement: true,
  });
  const resized = await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true }).toBuffer();
  const meta = await sharp(resized).metadata();

  return {
    buffer: resized,
    contentType: "image/jpeg",
    apifyUrl: imgUrl,
    dimensions: { width: meta.width || 0, height: meta.height || 0 },
    byteSize: resized.length,
  };
}
