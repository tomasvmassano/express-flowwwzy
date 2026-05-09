import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/studio/project/storage";
import { verifyIntakeToken } from "@/lib/studio/intake/tokens";
import { emptyIntake, IntakeContentSchema } from "@/lib/studio/intake/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

/**
 * GET /api/intake/[token]
 * Returns: { project: { id, business, tier }, intake }
 * The token IS the auth — no cookie needed. Token-bound to a single
 * projectId, expires in 30 days.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const verified = await verifyIntakeToken(token).catch(() => null);
  if (!verified) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 401 });
  }
  const project = await getProject(verified.projectId).catch(() => null);
  if (!project) {
    return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  }
  return NextResponse.json({
    project: {
      id: project.id,
      tier: project.tier,
      businessName: project.form.business.name,
      customerName: project.form.customer.name,
    },
    intake: project.intake || emptyIntake(),
  });
}

/**
 * PATCH /api/intake/[token]
 * Body: Partial<IntakeContent> (any subset of intake fields)
 * Returns: { intake } the updated intake
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const verified = await verifyIntakeToken(token).catch(() => null);
  if (!verified) {
    return NextResponse.json({ error: "invalid_or_expired_token" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const project = await getProject(verified.projectId).catch(() => null);
  if (!project) {
    return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  }

  // Merge body into existing intake; validate at the end.
  const merged = { ...(project.intake || emptyIntake()), ...(body as object), updatedAt: new Date().toISOString() };
  const parsed = IntakeContentSchema.safeParse(merged);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_intake_shape",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  await updateProject(verified.projectId, { intake: parsed.data });
  return NextResponse.json({ intake: parsed.data });
}
