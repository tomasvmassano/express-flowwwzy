"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "@/lib/store";
import { TIERS } from "@/lib/types";
import { track } from "@/lib/analytics";

const palettes: Record<string, { name: string; colors: string[] }> = {
  p1: { name: "Black & Cream", colors: ["#000000", "#0F1010", "#FAEBE3", "#ECECEC"] },
  p2: { name: "Forest", colors: ["#0F1F1A", "#2D4A3E", "#A8B89A", "#F5F1E8"] },
  p3: { name: "Coastal", colors: ["#0F2027", "#2C5364", "#88C8E0", "#F0F4F8"] },
  p4: { name: "Warm Sand", colors: ["#1F1611", "#5C3A21", "#D9A876", "#F5EDE3"] },
  p5: { name: "Bold Red", colors: ["#100808", "#8B1E1E", "#E8B871", "#F8F4EE"] },
  p6: { name: "Royal", colors: ["#0E1B2C", "#1B3A6B", "#C9A876", "#F5F1E8"] },
  p7: { name: "Mono Plus", colors: ["#000000", "#3A3A3A", "#B3B3B3", "#FCFCFC"] },
  p8: { name: "Sunset", colors: ["#1A0F1A", "#5C2D5C", "#F08C5C", "#FAEBE3"] },
};

const styleNames: Record<string, string> = {
  minimalista: "Minimalista & Editorial",
  bold: "Bold & Confiante",
  suave: "Suave & Premium",
  tech: "Tech & Futurista",
  caloroso: "Caloroso & Humano",
  clean: "Clean & Corporativo",
};

export default function PreviewScreen() {
  const f = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [extraPages, setExtraPages] = useState(0);
  const [addCopy, setAddCopy] = useState(false);

  const tier = f.tier ? TIERS[f.tier] : null;
  const palette = f.paletteFavourite ? palettes[f.paletteFavourite] : null;
  const accent = palette?.colors[2] || "#FAEBE3";

  const deliveryDate = useMemo(() => {
    if (!tier) return null;
    const days = tier.id === "page" ? 3 : tier.id === "site" ? 5 : 7;
    const d = new Date();
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" });
  }, [tier]);

  const total = useMemo(() => {
    let t = tier?.price || 0;
    if (addCopy) t += 200;
    if (extraPages > 0) t += extraPages * 150;
    return t;
  }, [tier, addCopy, extraPages]);

  const tone = (val: number, low: string, high: string) => (val < 33 ? low : val > 66 ? high : `${low}-${high}`);

  const checkout = async () => {
    if (submitting) return;
    setSubmitting(true);
    track("InitiateCheckout", { value: total, currency: "EUR", tier: f.tier });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: f.tier,
          total,
          extraPages,
          addCopy,
          customer: f.details,
          business: f.business,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.fallback) window.location.href = "/thank-you?demo=1";
      else throw new Error("No checkout URL");
    } catch (e) {
      console.error(e);
      window.location.href = "/thank-you?demo=1";
    }
  };

  if (f.step !== 8) return null;

  return (
    <section id="preview" className="py-16 md:py-24 spotlight">
      <div className="container-x max-w-[1080px]">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          >
            <span className="label">Direção pronta</span>
            <h2 className="mt-3 max-w-[22ch]">
              Aqui está o que vamos construir para{" "}
              <span className="italic-accent">{f.business.name || "o seu negócio"}</span>.
            </h2>

            <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8">
              <div className="card-dark p-7 md:p-9">
                <Row label="Pacote" value={`${tier?.name} · €${tier?.price}`} />
                <Row label="Estilo" value={f.style ? styleNames[f.style] : "—"} />
                <Row label="Tom de voz" value={
                  `${tone(f.toneProfCasual, "Profissional", "Casual")} · ${tone(f.toneCalmBold, "Calmo", "Bold")} · ${tone(f.toneClassicModern, "Clássico", "Moderno")}`
                } />
                <Row
                  label="Paleta"
                  value={
                    <div className="flex items-center gap-2">
                      {palette?.colors.map((c) => (
                        <span key={c} className="w-7 h-7 rounded-full border border-divider" style={{ background: c }} />
                      ))}
                      <span className="text-gray-300 text-body-sm ml-2">{palette?.name}</span>
                    </div>
                  }
                />
                <Row
                  label="VSL"
                  value={
                    <span className="text-body-sm">
                      {f.vsl.state === "have_it" ? "Sim, já tenho" : f.vsl.state === "will_record" ? "Vou gravar" : "Sem vídeo"}
                    </span>
                  }
                />
                <Row label="Entrega prevista" value={deliveryDate || ""} last />
              </div>

              {/* Visual preview tiles */}
              <div className="card-dark p-5 md:p-7">
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-card relative overflow-hidden"
                      style={{ background: palette?.colors[0] || "#0F1010" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `radial-gradient(circle at ${20 + i * 20}% ${30 + i * 10}%, ${accent}30, transparent 60%)`,
                        }}
                      />
                      <div className="absolute top-3 left-3 right-3 flex gap-1">
                        {[0, 1, 2].map((j) => (
                          <span key={j} className="h-1 flex-1 rounded-full" style={{ background: j === 0 ? accent : "#262626" }} />
                        ))}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="h-2 rounded-full mb-1.5" style={{ background: accent, width: "70%" }} />
                        <div className="h-1.5 rounded-full mb-1" style={{ background: "#262626", width: "90%" }} />
                        <div className="h-1.5 rounded-full" style={{ background: "#262626", width: "60%" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-body-sm text-gray-500 italic">
                  Direção visual baseada nas suas escolhas. O design final será 100% à medida do seu negócio.
                </p>
              </div>
            </div>

            {/* Upsells */}
            <div className="mt-10 grid md:grid-cols-2 gap-5">
              <UpsellCard
                title="Copywriting profissional"
                desc="Escrevemos cada palavra do site com base no brief. Headlines, CTAs e copy de conversão."
                price={200}
                checked={addCopy}
                onToggle={() => setAddCopy(!addCopy)}
              />
              <div className="card-dark p-6">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="text-h3" style={{ fontWeight: 500 }}>Páginas extra</h3>
                  <span className="text-cream font-medium">+€150 / página</span>
                </div>
                <p className="text-gray-500 text-body-sm mb-5">Adicione mais páginas além do incluído no pacote.</p>
                <div className="flex items-center gap-3">
                  <button
                    className="btn-dark !py-2.5 !px-4"
                    onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                  >−</button>
                  <span className="text-2xl font-medium w-10 text-center">{extraPages}</span>
                  <button
                    className="btn-dark !py-2.5 !px-4"
                    onClick={() => setExtraPages(Math.min(10, extraPages + 1))}
                  >+</button>
                </div>
              </div>
            </div>

            {/* Total + checkout */}
            <div className="mt-12 card-dark p-7 md:p-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="label">Total a pagar</span>
                <div className="text-5xl md:text-6xl font-medium mt-2" style={{ letterSpacing: "-0.03em" }}>
                  €{total}
                </div>
                <p className="text-gray-500 text-body-sm mt-2">Pagamento único. Sem subscrições.</p>
              </div>
              <button onClick={checkout} disabled={submitting} className="btn-primary text-base disabled:opacity-50">
                {submitting ? "A redirecionar..." : `Confirmar e pagar €${total} →`}
              </button>
            </div>

            <p className="mt-5 text-center text-gray-500 text-body-sm">
              Pagamento seguro via Stripe. Garantia de devolução de 14 dias.
            </p>

            <div className="mt-8 text-center">
              <button onClick={() => f.goto(7)} className="btn-tertiary text-body-sm">
                ← Editar respostas
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Row({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-6 py-5 ${last ? "" : "border-b border-divider"}`}>
      <span className="label flex-shrink-0 w-32 mt-1">{label}</span>
      <span className="text-right text-white text-base flex-1">{value}</span>
    </div>
  );
}

function UpsellCard({
  title, desc, price, checked, onToggle,
}: { title: string; desc: string; price: number; checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`card-dark p-6 text-left transition-colors duration-200 ${checked ? "step-active" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h3 className="text-h3" style={{ fontWeight: 500 }}>{title}</h3>
        <span className="text-cream font-medium">+€{price}</span>
      </div>
      <p className="text-gray-500 text-body-sm">{desc}</p>
      <div className="mt-5 flex items-center gap-2 text-body-sm">
        <span
          className={`inline-flex w-5 h-5 rounded border items-center justify-center ${
            checked ? "bg-cream border-cream" : "border-divider"
          }`}
        >
          {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </span>
        <span className={checked ? "text-white" : "text-gray-500"}>{checked ? "Adicionado" : "Adicionar"}</span>
      </div>
    </button>
  );
}
