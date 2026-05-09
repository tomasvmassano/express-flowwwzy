"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = data?.error || `http_${res.status}`;
        const map: Record<string, string> = {
          invalid_password: "Password incorreta.",
          not_configured: "STUDIO_PASSWORD não configurado em Vercel env vars.",
          auth_secret_not_configured: "STUDIO_AUTH_SECRET em falta ou inválido.",
        };
        setError(map[code] || code);
        setSubmitting(false);
        return;
      }
      const from = params.get("from") || "/studio";
      router.replace(from);
      // Soft refresh so middleware sees the new cookie on subsequent navs.
      router.refresh();
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-black text-[#EDEDED] flex items-center justify-center px-4"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[360px] border border-[#2A2A2A] rounded-lg p-6 sm:p-7 bg-[#0F0F0F]"
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-bold tracking-tight text-base">
            Flowwwzy<span className="text-[#FAEBE3]">.</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#666]">Studio</span>
        </div>
        <p className="text-xs text-[#666] mb-6">Acesso interno · password protegido.</p>

        <label className="block">
          <span className="block text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] mb-2">
            Password
          </span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-[#2A2A2A] rounded px-3 py-2.5 text-sm text-[#EDEDED] focus:outline-none focus:border-[#666]"
          />
        </label>

        {error && (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-5 w-full px-3 py-2.5 rounded bg-[#FAFAFA] text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
        >
          {submitting ? "A entrar…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
