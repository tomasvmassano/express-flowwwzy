import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/studio/project/storage";
import { proposePlan } from "@/lib/studio/proposer";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/studio/projects/[id]/propose
 *
 * Runs the AI plan proposer (theme + canon + matcher + content synth)
 * and stores the result on project.plan. Returns the proposed plan +
 * reasons + warnings so the operator can review before approval.
 *
 * Doesn't transition state — operator still needs to manually move
 * the project through paid → extracting → ready_audit → audited.
 * Plan stamping just makes the Generate step possible.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  let id: string;
  try {
    id = (await params).id;
  } catch {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const project = await getProject(id).catch(() => null);
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const result = await proposePlan(project);
    await updateProject(id, { plan: result.plan });
    return NextResponse.json({
      ok: true,
      plan: result.plan,
      reasons: result.reasons,
      warnings: result.warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[propose]", message);
    return NextResponse.json({ error: "propose_failed", message }, { status: 500 });
  }
}
