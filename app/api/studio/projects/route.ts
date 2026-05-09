import { NextRequest, NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/studio/project/storage";
import { emptyForm, ProjectSchema } from "@/lib/studio/project/types";

export const runtime = "nodejs";

/** GET /api/studio/projects?limit=20&offset=0&state=paid */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit = clampInt(params.get("limit"), 1, 100, 20);
  const offset = clampInt(params.get("offset"), 0, 10_000, 0);
  const stateParam = params.get("state");
  const state = stateParam && isValidState(stateParam) ? stateParam : undefined;

  try {
    const result = await listProjects({ limit, offset, state });
    return NextResponse.json(result);
  } catch (err) {
    return errResponse(err);
  }
}

/** POST /api/studio/projects — manual creation (operator/testing) */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Operator can pass anything from the Project shape; we fill in defaults
  // for missing required fields. Useful for quick creation in /studio UI.
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const draft = {
    state: "draft" as const,
    tier: (input.tier as "page" | "site" | "backoffice") || "site",
    form: { ...emptyForm(), ...((input.form as object) || {}) },
    references: (input.references as unknown[] as Array<{ url: string; status: "pending" | "extracting" | "done" | "failed" }>) || [],
    ...input, //  let caller override anything else
  };

  // Validate the partial — createProject does a final ProjectSchema.parse.
  try {
    const project = await createProject(draft as Parameters<typeof createProject>[0]);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return errResponse(err);
  }
}

// ─── helpers ───────────────────────────────────────────────────────────

function clampInt(raw: string | null, min: number, max: number, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function isValidState(s: string): s is import("@/lib/studio/project/types").ProjectState {
  return ProjectSchema.shape.state.safeParse(s).success;
}

function errResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "unknown";
  console.error("[api/studio/projects]", message);
  // Surface storage configuration errors with a clearer status so the
  // operator knows the problem is env-vars, not their input.
  if (message.startsWith("Upstash Redis not configured")) {
    return NextResponse.json({ error: "storage_not_configured", message }, { status: 503 });
  }
  return NextResponse.json({ error: "internal", message }, { status: 500 });
}
