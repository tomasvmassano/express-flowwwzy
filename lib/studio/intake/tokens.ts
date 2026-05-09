/**
 * Intake tokens — magic links to /intake/[token] for post-payment
 * content collection. Self-validating: no DB lookups.
 *
 * Token format:
 *   `${projectId}.${expiresAt}.${HMAC-SHA256(SECRET, projectId+expiresAt).hex16}`
 *
 * Edge-runtime compatible (Web Crypto only). Same secret as the studio
 * cookie — STUDIO_AUTH_SECRET — so we don't carry a second key.
 */

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30; //  30 days

function getSecret(): string {
  const s = process.env.STUDIO_AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("STUDIO_AUTH_SECRET must be set to >=16 chars");
  }
  return s;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

export async function createIntakeToken(projectId: string, ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const expiresAt = Date.now() + ttlMs;
  const key = await importHmacKey(getSecret());
  const payload = `${projectId}.${expiresAt}`;
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  // 16 hex chars (8 bytes) of the signature is plenty for a non-cryptographic-attack
  // surface (operator-shared link); keeps the URL short.
  const sigHex = bufferToHex(sig).slice(0, 16);
  return `${projectId}.${expiresAt}.${sigHex}`;
}

export async function verifyIntakeToken(token: string): Promise<{ projectId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [projectId, expStr, sigHex] = parts;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  let expected: string;
  try {
    const key = await importHmacKey(getSecret());
    const payload = `${projectId}.${expiresAt}`;
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    expected = bufferToHex(sig).slice(0, 16);
  } catch {
    return null;
  }

  if (!safeEqual(sigHex, expected)) return null;
  return { projectId };
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
