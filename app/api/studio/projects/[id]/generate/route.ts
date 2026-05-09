import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject } from "@/lib/studio/project/storage";
import { canTransition } from "@/lib/studio/project/types";
import { generateProject, projectSlug, summarizeFiles, GenerateError } from "@/lib/studio/generator";
import { deployToVercel, DeployError } from "@/lib/studio/generator/deploy";
import { sendSiteLiveEmail } from "@/lib/studio/email/send";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/studio/projects/[id]/generate
 *
 * Runs the generator + Vercel deploy in sequence. The deployment is
 * kicked off but we DON'T poll for ready inside this request — the
 * 60s hobby ceiling is too tight for first-time installs. Instead, we
 * return the deployment URL/ID and the operator polls from the UI.
 *
 * State machine: audited → generating → deployed (delivered after
 * Component 10 sends the email).
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

  if (project.state !== "audited" && project.state !== "failed") {
    return NextResponse.json(
      {
        error: "wrong_state",
        message: `Project must be in state 'audited' to generate. Current state: ${project.state}.`,
      },
      { status: 409 }
    );
  }
  if (!canTransition(project.state, "generating")) {
    return NextResponse.json({ error: "invalid_transition" }, { status: 409 });
  }

  // Mark generating
  await updateProject(id, { state: "generating", failureReason: undefined, failedAt: undefined });

  // Generate files
  let files: Awaited<ReturnType<typeof generateProject>>;
  try {
    files = await generateProject(project);
  } catch (err) {
    const message = err instanceof GenerateError ? err.message : String(err);
    await updateProject(id, {
      state: "failed",
      failureReason: `generate: ${message}`,
      failedAt: new Date().toISOString(),
    });
    return NextResponse.json({ error: "generate_failed", message }, { status: 500 });
  }

  const summary = summarizeFiles(files);
  const slug = projectSlug(project);

  // Deploy
  try {
    const result = await deployToVercel({ slug, files });
    const deployedUrl = `https://${result.url}`;
    await updateProject(id, {
      state: "deployed",
      deployedUrl,
      vercelProjectId: result.projectId,
      libraryVersion: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    });

    // Fire-and-forget email — don't fail the whole request if email errors,
    // just log the failure. Operator can resend manually from /studio later.
    let emailSent = false;
    let emailError: string | null = null;
    if (project.form.customer.email && process.env.RESEND_API_KEY) {
      try {
        await sendSiteLiveEmail({
          to: project.form.customer.email,
          customerName: project.form.customer.name,
          businessName: project.form.business.name || slug,
          deployedUrl,
          inspectorUrl: result.inspectorUrl,
        });
        emailSent = true;
        await updateProject(id, {
          state: "delivered",
          emailSentAt: new Date().toISOString(),
        });
      } catch (emailErr) {
        emailError = emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error("[generate] email send failed", emailError);
      }
    }

    return NextResponse.json({
      ok: true,
      slug,
      deploymentId: result.deploymentId,
      deployedUrl,
      inspectorUrl: result.inspectorUrl,
      filesSummary: summary,
      emailSent,
      emailError,
    });
  } catch (err) {
    const message = err instanceof DeployError ? err.message : String(err);
    const detail = err instanceof DeployError ? err.detail : undefined;
    await updateProject(id, {
      state: "failed",
      failureReason: `deploy: ${message}`,
      failedAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "deploy_failed", message, detail, filesSummary: summary },
      { status: 500 }
    );
  }
}
