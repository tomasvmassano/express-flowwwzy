/**
 * Vercel deployment via REST API.
 *
 * Takes the file Map produced by the generator and pushes it as a
 * fresh deployment. We don't pre-create a Project — the deployment
 * endpoint creates one implicitly when given a name that doesn't exist.
 *
 * V1 deploys to the operator's Vercel account (configured via
 * VERCEL_API_TOKEN). Each generated project gets a `.vercel.app`
 * subdomain matching the slug.
 */

import type { GeneratedFiles } from ".";

const VERCEL_API = "https://api.vercel.com";

export type DeployResult = {
  deploymentId: string;
  url: string; //  e.g. site-abc123.vercel.app
  projectId: string;
  inspectorUrl: string;
};

export class DeployError extends Error {
  constructor(message: string, public detail?: unknown) {
    super(message);
  }
}

export async function deployToVercel(opts: {
  slug: string;
  files: GeneratedFiles;
  /** Optional team scope. If your token belongs to a team, pass its slug. */
  teamId?: string;
}): Promise<DeployResult> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new DeployError("VERCEL_API_TOKEN is not set");
  }

  const { slug, files, teamId } = opts;

  // Build the deployment payload. Each file becomes a record with
  // base64-encoded content. Vercel's v13 endpoint accepts inline files
  // up to ~10MB total — generated client projects sit at <500KB, so
  // we don't need the SHA upload flow.
  const filePayload: { file: string; data: string; encoding: "base64" }[] = [];
  for (const [path, content] of files) {
    filePayload.push({
      file: path,
      data: Buffer.from(content, "utf8").toString("base64"),
      encoding: "base64",
    });
  }

  const body = {
    name: slug,
    files: filePayload,
    target: "production" as const,
    projectSettings: {
      framework: "nextjs",
      buildCommand: null,
      installCommand: null,
      outputDirectory: null,
    },
  };

  const teamQ = teamId ? `?teamId=${teamId}` : "";
  const res = await fetch(`${VERCEL_API}/v13/deployments${teamQ}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new DeployError(`Vercel deploy failed (${res.status})`, detail);
  }

  const data = (await res.json()) as {
    id: string;
    url: string;
    projectId?: string;
    inspectorUrl?: string;
    alias?: string[];
  };

  // Vercel returns two URL families on a production deploy:
  //   - data.url           e.g. site-abc123-h7g8j9k.vercel.app  (THIS deployment, changes every push)
  //   - data.alias[]       e.g. ["site-abc123.vercel.app", "site-abc123-acme.vercel.app"]  (stable aliases the
  //                        deployment is promoted to once READY — same across regenerations of the same project)
  // We want the stable one so the operator can share a permanent URL.
  // Pick the shortest .vercel.app alias (canonical form is `<slug>.vercel.app`).
  const aliases = (data.alias || []).filter((a) => a.endsWith(".vercel.app"));
  const stableUrl =
    aliases.length > 0 ? aliases.sort((a, b) => a.length - b.length)[0] : data.url;

  return {
    deploymentId: data.id,
    url: stableUrl, //  bare domain, no protocol
    projectId: data.projectId || "",
    inspectorUrl: data.inspectorUrl || `https://vercel.com/dashboard`,
  };
}

/**
 * Poll the deployment until it's READY (or fail). Returns when the
 * site is actually live, not when the build queue accepted it.
 *
 * Caller decides how long to wait; a sensible cap is ~3 min (Next.js
 * builds are usually <1 min, but cold installs can stretch it).
 */
export async function waitForReady(
  deploymentId: string,
  opts: { maxMs?: number; teamId?: string } = {}
): Promise<{ readyState: string; elapsedMs: number }> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new DeployError("VERCEL_API_TOKEN is not set");

  const maxMs = opts.maxMs ?? 180_000;
  const teamQ = opts.teamId ? `?teamId=${opts.teamId}` : "";
  const start = Date.now();

  while (Date.now() - start < maxMs) {
    const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}${teamQ}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new DeployError(`status check failed (${res.status})`);
    }
    const data = (await res.json()) as { readyState?: string; status?: string };
    const state = data.readyState || data.status || "UNKNOWN";

    if (state === "READY") return { readyState: state, elapsedMs: Date.now() - start };
    if (state === "ERROR" || state === "CANCELED") {
      throw new DeployError(`deployment ${state.toLowerCase()}`, data);
    }

    await new Promise((r) => setTimeout(r, 4000));
  }

  throw new DeployError(`deployment did not become ready within ${maxMs}ms`);
}
