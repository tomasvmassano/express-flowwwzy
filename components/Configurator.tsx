"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "@/lib/store";
import { Style, TIERS, Tier } from "@/lib/types";
import { track } from "@/lib/analytics";

const TOTAL = 7;

const styles: { id: Style; name: string; desc: string; gradient: string; accent: string }[] = [
  { id: "minimalista", name: "Minimalista & Editorial", desc: "Espaço, tipografia, calma.", gradient: "linear-gradient(140deg, #1a1a1a, #050505)", accent: "#ECECEC" },
  { id: "bold", name: "Bold & Confiante", desc: "Cores fortes, contraste alto.", gradient: "linear-gradient(140deg, #2D1B14, #1a0f0a)", accent: "#E8B871" },
  { id: "suave", name: "Suave & Premium", desc: "Tons quentes, detalhes serif.", gradient: "linear-gradient(140deg, #2A2018, #0F0B08)", accent: "#FAEBE3" },
  { id: "tech", name: "Tech & Futurista", desc: "Gradientes, glow, dark.", gradient: "linear-gradient(140deg, #0F2027, #050a0f)", accent: "#88C8E0" },
  { id: "caloroso", name: "Caloroso & Humano", desc: "Fotografia real, tons terra.", gradient: "linear-gradient(140deg, #2D1F18, #14100c)", accent: "#D9A876" },
  { id: "clean", name: "Clean & Corporativo", desc: "Estrutura, clareza, foco.", gradient: "linear-gradient(140deg, #0E1B2C, #060a14)", accent: "#4A7DAB" },
];

const palettes = [
  { id: "p1", name: "Black & Cream", colors: ["#000000", "#0F1010", "#FAEBE3", "#ECECEC"] },
  { id: "p2", name: "Forest", colors: ["#0F1F1A", "#2D4A3E", "#A8B89A", "#F5F1E8"] },
  { id: "p3", name: "Coastal", colors: ["#0F2027", "#2C5364", "#88C8E0", "#F0F4F8"] },
  { id: "p4", name: "Warm Sand", colors: ["#1F1611", "#5C3A21", "#D9A876", "#F5EDE3"] },
  { id: "p5", name: "Bold Red", colors: ["#100808", "#8B1E1E", "#E8B871", "#F8F4EE"] },
  { id: "p6", name: "Royal", colors: ["#0E1B2C", "#1B3A6B", "#C9A876", "#F5F1E8"] },
  { id: "p7", name: "Mono Plus", colors: ["#000000", "#3A3A3A", "#B3B3B3", "#FCFCFC"] },
  { id: "p8", name: "Sunset", colors: ["#1A0F1A", "#5C2D5C", "#F08C5C", "#FAEBE3"] },
];

const sectionOptions = [
  "Hero / Apresentação",
  "Serviços / Produtos",
  "Sobre nós",
  "Testemunhos",
  "FAQ",
  "Contacto",
  "Galeria / Portfolio",
  "Blog",
];

export default function Configurator() {
  const f = useForm();
  const [other, setOther] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Steps 1-7 are the form. Step 8 is the preview/checkout commit screen.
  const step = f.step;
  const progress = step >= 1 && step <= 7 ? ((step - 1) / TOTAL) * 100 + 100 / TOTAL : 0;

  // Migrate legacy step=0 state and lazily fire FormStarted on first interaction.
  useEffect(() => {
    if (!hydrated) return;
    if (f.step === 0) f.goto(1);
    track("FormStarted");
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const canContinue = useMemo(() => {
    switch (step) {
      case 1: return !!f.tier;
      case 2: return !!f.style;
      case 3: return !!f.paletteFavourite;
      case 4: return true;
      case 5: return f.business.name.trim().length > 0 && f.business.what.trim().length > 0;
      case 6: return true;
      case 7: return f.details.name.trim().length > 0 && /^\S+@\S+\.\S+$/.test(f.details.email);
      default: return false;
    }
  }, [step, f.tier, f.style, f.paletteFavourite, f.business, f.details]);

  const goNext = async () => {
    if (step === 7) {
      track("FormCompleted", { tier: f.tier, value: f.tier ? TIERS[f.tier].price : null, currency: "EUR" });
      // Send lead to webhook in background
      try {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: f.tier,
            style: f.style,
            palette: f.paletteFavourite,
            avoid: f.paletteAvoid,
            tone: { profCasual: f.toneProfCasual, calmBold: f.toneCalmBold, classicModern: f.toneClassicModern },
            business: f.business,
            references: f.references,
            sections: f.sections,
            details: f.details,
            needCopy: f.needCopy,
            needLogo: f.needLogo,
          }),
        });
      } catch {}
      f.goto(8);
      setTimeout(() => document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      f.next();
    }
  };

  if (!hydrated) {
    return (
      <section id="configurator" className="py-16 md:py-24">
        <div className="container-x" />
      </section>
    );
  }

  return (
    <section id="configurator" className="py-16 md:py-24 spotlight">
      <div className="container-x max-w-[1080px]">
        {step >= 1 && step <= 7 && (
          <>
            <div className="flex items-center justify-between mb-3 text-body-sm">
              <span className="label">Passo {step} de {TOTAL}</span>
              {f.tier && (
                <span className="text-gray-500">
                  {TIERS[f.tier].name} · <span className="text-white">€{TIERS[f.tier].price}</span>
                </span>
              )}
            </div>
            <div className="h-1 w-full bg-divider rounded-full overflow-hidden mb-10 md:mb-14">
              <motion.div
                className="h-full bg-cream"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.165, 0.84, 0.44, 1] }}
              >
                {step === 1 && <Step1 />}
                {step === 2 && <Step2 />}
                {step === 3 && <Step3 />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 />}
                {step === 6 && <Step6 other={other} setOther={setOther} />}
                {step === 7 && <Step7 />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 md:mt-16 flex items-center justify-between gap-4">
              <button
                onClick={f.back}
                disabled={step === 1}
                className="btn-tertiary disabled:opacity-30 disabled:pointer-events-none"
              >
                ← Voltar
              </button>
              <button
                onClick={goNext}
                disabled={!canContinue}
                className="btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                {step === 7 ? "Ver o meu projeto →" : "Continuar →"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Step1() {
  const { tier, setField } = useForm();
  const list: { id: Tier; tag?: string }[] = [
    { id: "page" },
    { id: "site", tag: "Mais Popular" },
    { id: "backoffice" },
  ];
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[18ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Qual é o pacote certo para si?
      </h3>
      <p className="mt-4 text-gray-300 max-w-[52ch]">Pode mudar de opinião nos próximos passos.</p>
      <div className="mt-10 grid md:grid-cols-3 gap-5">
        {list.map(({ id, tag }) => {
          const t = TIERS[id];
          const active = tier === id;
          return (
            <button
              key={id}
              onClick={() => setField("tier", id)}
              className={`relative card-dark p-6 md:p-7 text-left ${active ? "step-active" : ""}`}
            >
              {tag && <div className="absolute -top-2.5 left-5 popular-badge">{tag}</div>}
              <div className="label mb-3">{t.name}</div>
              <div className="text-4xl md:text-5xl font-medium" style={{ letterSpacing: "-0.03em" }}>€{t.price}</div>
              <div className="text-gray-500 text-body-sm mt-2">Entrega em {t.delivery}</div>
              <div className="text-gray-300 text-body-sm mt-4">{t.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2() {
  const { style, setField } = useForm();
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[20ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Que estilo se <span className="italic-accent">identifica</span> mais consigo?
      </h3>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {styles.map((s) => {
          const active = style === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setField("style", s.id)}
              className={`relative card-dark overflow-hidden text-left ${active ? "step-active" : ""}`}
            >
              <div className="aspect-[4/5] relative" style={{ background: s.gradient }}>
                <div
                  className="absolute inset-0 opacity-50"
                  style={{ backgroundImage: `radial-gradient(circle at 30% 30%, ${s.accent}40, transparent 50%)` }}
                />
                <div className="absolute top-5 left-5 right-5">
                  <div className="text-2xl md:text-3xl font-medium" style={{ color: s.accent, letterSpacing: "-0.02em" }}>
                    Aa
                  </div>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="text-white font-semibold text-base md:text-lg">{s.name}</div>
                  <div className="text-gray-500 text-body-sm">{s.desc}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step3() {
  const { paletteFavourite, paletteAvoid, setField } = useForm();
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[20ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Que paleta de cores prefere?
      </h3>
      <p className="mt-4 text-gray-300 max-w-[52ch]">Escolha uma favorita. Opcionalmente, marque uma a evitar.</p>
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {palettes.map((p) => {
          const fav = paletteFavourite === p.id;
          const avoid = paletteAvoid === p.id;
          return (
            <div
              key={p.id}
              className={`card-dark p-4 ${fav ? "step-active" : avoid ? "border-divider opacity-40" : ""}`}
            >
              <div className="grid grid-cols-4 gap-1.5 mb-4">
                {p.colors.map((c) => (
                  <div key={c} className="aspect-square rounded" style={{ background: c }} />
                ))}
              </div>
              <div className="text-body-sm text-white mb-3">{p.name}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setField("paletteFavourite", fav ? null : p.id)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-colors duration-200 ${
                    fav ? "bg-cream text-black" : "bg-black/40 text-white border border-divider hover:border-cream"
                  }`}
                >
                  {fav ? "Favorita ✓" : "Favorita"}
                </button>
                <button
                  onClick={() => setField("paletteAvoid", avoid ? null : p.id)}
                  className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-colors duration-200 ${
                    avoid ? "bg-divider text-white" : "bg-black/40 text-gray-500 border border-divider hover:border-gray-500"
                  }`}
                >
                  {avoid ? "A evitar ✓" : "Evitar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step4() {
  const { toneProfCasual, toneCalmBold, toneClassicModern, setField } = useForm();
  const labels = { profCasual: "toneProfCasual", calmBold: "toneCalmBold", classicModern: "toneClassicModern" } as const;
  const sliders: { id: keyof typeof labels; left: string; right: string; value: number }[] = [
    { id: "profCasual", left: "Profissional", right: "Casual", value: toneProfCasual },
    { id: "calmBold", left: "Calmo", right: "Bold", value: toneCalmBold },
    { id: "classicModern", left: "Clássico", right: "Moderno", value: toneClassicModern },
  ];
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[18ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Como quer <span className="italic-accent">comunicar</span>?
      </h3>
      <div className="mt-12 space-y-12 max-w-[640px]">
        {sliders.map((s) => (
          <div key={s.id}>
            <div className="flex justify-between text-body-sm mb-3">
              <span className="text-gray-300">{s.left}</span>
              <span className="text-gray-300">{s.right}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={s.value}
              onChange={(e) => setField(labels[s.id], Number(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5() {
  const { business, setField } = useForm();
  const update = (k: keyof typeof business, v: string) => setField("business", { ...business, [k]: v });
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[20ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Conte-nos sobre o seu negócio.
      </h3>
      <div className="mt-10 grid gap-5 max-w-[680px]">
        <div>
          <label className="label block mb-2">Nome do negócio</label>
          <input className="input-dark" value={business.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Santa Justa Restaurante" />
        </div>
        <div>
          <label className="label block mb-2">O que faz? (1-2 frases)</label>
          <textarea
            className="input-dark min-h-[88px] resize-y"
            value={business.what}
            onChange={(e) => update("what", e.target.value)}
            placeholder="Restaurante mediterrânico em Lisboa, foco em produto sazonal..."
          />
        </div>
        <div>
          <label className="label block mb-2">O que faz de diferente da concorrência?</label>
          <textarea
            className="input-dark min-h-[120px] resize-y"
            value={business.differentiator}
            onChange={(e) => update("differentiator", e.target.value)}
            placeholder="Carta semanal escrita pela chef, ingredientes 100% nacionais..."
          />
        </div>
      </div>
    </div>
  );
}

function Step6({ other, setOther }: { other: string; setOther: (v: string) => void }) {
  const { references, sections, setField } = useForm();
  const setRef = (i: number, v: string) => {
    const next = [...references]; next[i] = v; setField("references", next);
  };
  const toggleSection = (s: string) => {
    setField("sections", sections.includes(s) ? sections.filter((x) => x !== s) : [...sections, s]);
  };
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[22ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Inspiração e <span className="italic-accent">estrutura</span>.
      </h3>
      <p className="mt-4 text-gray-300">3 sites que adora (cole os links). Salte se quiser.</p>
      <div className="mt-8 grid gap-4 max-w-[680px]">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            type="url"
            inputMode="url"
            className="input-dark"
            placeholder={`https://exemplo${i + 1}.com`}
            value={references[i] || ""}
            onChange={(e) => setRef(i, e.target.value)}
          />
        ))}
      </div>

      <div className="mt-14">
        <p className="label mb-5">Que secções precisa no site?</p>
        <div className="flex flex-wrap gap-2.5">
          {sectionOptions.map((s) => {
            const on = sections.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSection(s)}
                className={`px-4 py-2.5 rounded-full text-body-sm border transition-colors duration-200 ${
                  on ? "bg-cream text-black border-cream" : "bg-transparent text-gray-300 border-divider hover:border-white"
                }`}
              >
                {on ? "✓ " : "+ "}{s}
              </button>
            );
          })}
        </div>
        <div className="mt-5 max-w-[480px]">
          <input
            className="input-dark"
            placeholder="Outra secção (opcional)"
            value={other}
            onChange={(e) => {
              setOther(e.target.value);
              const filtered = sections.filter((x) => !x.startsWith("Outro:"));
              setField("sections", e.target.value ? [...filtered, `Outro: ${e.target.value}`] : filtered);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Step7() {
  const { details, needCopy, needLogo, setField } = useForm();
  const update = (k: keyof typeof details, v: string) => setField("details", { ...details, [k]: v });
  return (
    <div>
      <h3 className="text-3xl md:text-h2 max-w-[20ch]" style={{ fontWeight: 500, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        Os seus <span className="italic-accent">detalhes</span>.
      </h3>
      <p className="mt-4 text-gray-300">Para podermos enviar o brief inicial e arrancar.</p>

      <div className="mt-10 grid gap-5 max-w-[680px]">
        <div>
          <label className="label block mb-2">Nome completo</label>
          <input className="input-dark" value={details.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="label block mb-2">Email</label>
            <input className="input-dark" type="email" value={details.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label block mb-2">Telefone (opcional)</label>
            <input className="input-dark" type="tel" value={details.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="label mb-2">Logo / assets</p>
          <CheckboxRow
            checked={needLogo}
            onChange={(v) => setField("needLogo", v)}
            label="Preciso de ajuda com isto"
            sub="Adicionamos design de logo e assets ao projeto."
          />
        </div>

        <div className="mt-2 space-y-3">
          <p className="label mb-2">Copy</p>
          <CheckboxRow
            checked={needCopy}
            onChange={(v) => setField("needCopy", v)}
            label="Escreva para mim"
            sub="A nossa equipa de copy escreve o site inteiro com base no brief."
          />
        </div>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked, onChange, label, sub,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full card-dark p-5 flex items-start gap-4 text-left transition-colors duration-200 ${
        checked ? "step-active" : ""
      }`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors duration-200 ${
          checked ? "bg-cream border-cream" : "border-divider"
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span>
        <span className="block text-white font-medium">{label}</span>
        <span className="block text-gray-500 text-body-sm mt-1">{sub}</span>
      </span>
    </button>
  );
}
