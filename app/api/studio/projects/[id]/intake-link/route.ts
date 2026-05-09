import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/studio/project/storage";
import { createIntakeToken } from "@/lib/studio/intake/tokens";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/studio/projects/[id]/intake-link
 *
 * Generates a magic link for the client to fill in post-payment intake
 * content. Auth-gated by the studio middleware (only operator can ask).
 * Returns the URL — the operator emails it to the client manually for
 * V1, automated send via Resend can come later.
 */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const project = await getProject(id).catch(() => null);
  if (!project) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  let token: string;
  try {
    token = await createIntakeToken(id);
  } catch (err) {
    return NextResponse.json({ error: "token_creation_failed", message: String(err) }, { status: 500 });
  }
  const origin = req.headers.get("origin") || "https://express-flowwwzy.vercel.app";
  const url = `${origin}/intake/${token}`;
  return NextResponse.json({ token, url });
}
