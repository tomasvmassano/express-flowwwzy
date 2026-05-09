/**
 * Resend wrapper — currently sends a single template: site-live.
 *
 * Domain note: until you verify a sender domain in Resend, you can
 * only send from `onboarding@resend.dev`. RESEND_FROM_EMAIL falls back
 * to that. After verifying flowwwzy.com, set the env var to your real
 * sender (e.g. hello@flowwwzy.com).
 */

import { Resend } from "resend";

export type SiteLiveEmailParams = {
  to: string;
  customerName?: string;
  businessName: string;
  deployedUrl: string;
  inspectorUrl?: string;
};

let _client: Resend | null = null;

function getClient(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _client = new Resend(key);
  return _client;
}

export async function sendSiteLiveEmail(p: SiteLiveEmailParams): Promise<{ id: string }> {
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const subject = `O seu site está online — ${p.businessName}`;
  const greeting = p.customerName ? `Olá ${p.customerName.split(" ")[0]},` : "Olá,";

  const html = `<!doctype html>
<html lang="pt-PT">
  <body style="font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; background:#0A0A0A; color:#EDEDED; margin:0; padding:32px 16px;">
    <div style="max-width:560px; margin:0 auto; background:#0F0F0F; border:1px solid #2A2A2A; border-radius:12px; padding:32px;">
      <p style="margin:0 0 16px 0; color:#888; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; font-weight:600;">Flowwwzy Express</p>
      <h1 style="margin:0 0 16px 0; font-size:28px; line-height:1.15; letter-spacing:-0.02em; color:#FFFFFF;">O seu site está online.</h1>
      <p style="margin:0 0 24px 0; color:#CCC; line-height:1.5;">${greeting}<br><br>O site para <strong>${escapeHtml(p.businessName)}</strong> foi gerado e publicado. Pode aceder em:</p>
      <p style="margin:0 0 28px 0;">
        <a href="${p.deployedUrl}" style="display:inline-block; background:#FAFAFA; color:#000; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px;">Abrir site →</a>
      </p>
      <p style="margin:0 0 24px 0; color:#888; font-size:13px;">URL: <a href="${p.deployedUrl}" style="color:#EDEDED;">${p.deployedUrl}</a></p>
      <p style="margin:0; color:#888; font-size:13px; line-height:1.5;">Próximos passos: <br>· Reveja o site<br>· Responda a este email com qualquer ajuste<br>· 14 dias de suporte pós-lançamento incluídos</p>
      <hr style="border:none; border-top:1px solid #2A2A2A; margin:24px 0 16px 0;">
      <p style="margin:0; color:#666; font-size:11px;">Flowwwzy Express · entregue pela equipa por trás da Flowwwzy.</p>
    </div>
  </body>
</html>`;

  const text = `${greeting}

O site para ${p.businessName} está online.

URL: ${p.deployedUrl}

Próximos passos:
· Reveja o site
· Responda a este email com qualquer ajuste
· 14 dias de suporte pós-lançamento incluídos

— Flowwwzy Express`;

  const client = getClient();
  const res = await client.emails.send({
    from,
    to: [p.to],
    subject,
    html,
    text,
  });

  if (res.error) {
    throw new Error(`Resend send failed: ${res.error.message || JSON.stringify(res.error)}`);
  }
  if (!res.data?.id) {
    throw new Error("Resend returned no email id");
  }
  return { id: res.data.id };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}
