import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const webhook = process.env.LEAD_WEBHOOK_URL;

  // Always log so the team has the lead even if webhook isn't configured.
  console.log("[lead]", JSON.stringify(body));

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "flowwwzy-express", at: new Date().toISOString(), ...body }),
      });
    } catch (e) {
      console.error("[lead] webhook failed", e);
    }
  }

  return NextResponse.json({ ok: true });
}
