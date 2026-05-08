/**
 * Screenshot capture via Apify (apify/screenshot-url actor).
 *
 * Returns the screenshot as a Buffer + content type. The matcher and
 * analyzer never see Apify-specific shapes; if we swap providers later,
 * only this file changes.
 */

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "apify~screenshot-url";

export type Screenshot = {
  buffer: Buffer;
  contentType: "image/png";
  /** Where the screenshot lives in Apify's KV store — kept for cache/debug */
  apifyUrl: string;
};

export async function takeScreenshot(url: string): Promise<Screenshot> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set in env vars");
  }

  // 1) Run the actor synchronously. ~3-8s for a single URL.
  const runRes = await fetch(
    `${APIFY_BASE}/acts/${ACTOR_ID}/run-sync?token=${token}&memory=1024&timeout=90`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: [{ url }],
        format: "png",
        waitUntil: "networkidle2",
        delay: 1500,
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
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  return { buffer, contentType: "image/png", apifyUrl: imgUrl };
}
