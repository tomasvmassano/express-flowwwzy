/**
 * Studio session auth — HMAC-signed cookie, Edge-runtime compatible.
 *
 * The cookie value is `${timestamp}.${hex(HMAC-SHA256(SECRET, timestamp))}`.
 * No DB, no session store — verification just re-signs the timestamp and
 * compares. Tokens expire after MAX_AGE_MS.
 *
 * The cookie never contains the password. Leaking it gives access until
 * expiry but doesn't reveal credentials. Anyone who knows STUDIO_AUTH_SECRET
 * can forge tokens, so treat it like a password and rotate if exposed.
 */

const COOKIE_NAME = "studio_auth";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const STUDIO_COOKIE = COOKIE_NAME;
export const STUDIO_COOKIE_MAX_AGE_S = Math.floor(MAX_AGE_MS / 1000);

function getSecret(): string {
  const s = process.env.STUDIO_AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "STUDIO_AUTH_SECRET must be set to a string of at least 16 chars"
    );
  }
  return s;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export async function signSessionToken(now = Date.now()): Promise<string> {
  const key = await importHmacKey(getSecret());
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(String(now))
  );
  return `${now}.${bufferToHex(sig)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const tsStr = token.slice(0, dot);
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return false;

  const ageMs = Date.now() - ts;
  if (ageMs < 0 || ageMs > MAX_AGE_MS) return false;

  let expected: string;
  try {
    expected = await signSessionToken(ts);
  } catch {
    return false;
  }
  return safeEqual(token, expected);
}

/** Constant-time-ish string compare so we don't leak length-based timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
