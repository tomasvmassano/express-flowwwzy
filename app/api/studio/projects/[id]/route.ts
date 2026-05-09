import { NextRequest, NextResponse } from "next/server";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/studio/project/storage";
import { canTransition, ProjectSchema } from "@/lib/studio/project/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/studio/projects/[id] */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (err) {
    return errResponse(err);
  }
}

/** PATCH /api/studio/projects/[id] — partial update (state transitions, edits) */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const { id } = await params;
    const existing = await getProject(id);
    if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // If state is being changed, enforce the state-machine.
    const patch = body as Record<string, unknown>;
    const nextState = patch.state as string | undefined;
    if (nextState) {
      const validated = ProjectSchema.shape.state.safeParse(nextState);
      if (!validated.success) {
        return NextResponse.json({ error: "invalid_state" }, { status: 400 });
      }
      if (!canTransition(existing.state, validated.data)) {
        return NextResponse.json(
          {
            error: "invalid_transition",
            from: existing.state,
            to: validated.data,
          },
          { status: 409 }
        );
      }
    }

    const updated = await updateProject(id, patch as Parameters<typeof updateProject>[1]);
    return NextResponse.json(updated);
  } catch (err) {
    return errResponse(err);
  }
}

/** DELETE /api/studio/projects/[id] — operator-only, irreversible. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const deleted = await deleteProject(id);
    if (!deleted) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errResponse(err);
  }
}

function errResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "unknown";
  console.error("[api/studio/projects/[id]]", message);
  if (message.startsWith("Upstash Redis not configured")) {
    return NextResponse.json({ error: "storage_not_configured", message }, { status: 503 });
  }
  return NextResponse.json({ error: "internal", message }, { status: 500 });
}
