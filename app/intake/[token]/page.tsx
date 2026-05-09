"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { IntakeContent } from "@/lib/studio/intake/types";

type ProjectMeta = {
  id: string;
  tier: string;
  businessName: string;
  customerName?: string;
};

const CARD_ORDER = [
  "positioning",
  "assets",
  "services",
  "testimonials",
  "stats",
  "process",
  "faq",
  "gallery",
  "pricing",
  "contact",
] as const;

type CardKey = (typeof CARD_ORDER)[number];

const CARD_META: Record<CardKey, { title: string; description: string }> = {
  positioning: {
    title: "Posicionamento",
    description: "Em 2-3 frases, o que faz e para quem. O AI usa isto para escrever o hero.",
  },
  assets: {
    title: "Logo e cores",
    description: "URL do logo (se já o tem alojado algures), cor primária da marca, fontes principais.",
  },
  services: {
    title: "Serviços",
    description: "Os serviços ou produtos que oferece. Para cada: título + descrição + preço (opcional).",
  },
  testimonials: {
    title: "Testemunhos",
    description: "Depoimentos de clientes reais. Quote + nome + cargo/empresa.",
  },
  stats: {
    title: "Métricas",
    description: "Números que demonstram credibilidade (anos no mercado, clientes, projetos, etc.).",
  },
  process: {
    title: "Processo",
    description: "Os passos como trabalha. Cada passo: título + descrição.",
  },
  faq: {
    title: "FAQ",
    description: "Perguntas que os clientes tipicamente fazem antes de comprar.",
  },
  gallery: {
    title: "Galeria",
    description: "URLs de imagens do trabalho/produto/espaço. Use Imgur, Cloudinary ou similar para alojar.",
  },
  pricing: {
    title: "Pricing",
    description: "Tiers de preço se aplicável. Cada tier: nome + preço + features.",
  },
  contact: {
    title: "Contactos",
    description: "Email, telefone, morada, redes sociais.",
  },
};

export default function IntakePage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<ProjectMeta | null>(null);
  const [intake, setIntake] = useState<IntakeContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/intake/${token}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || `error ${res.status}`);
          return;
        }
        setMeta(data.project);
        setIntake(data.intake);
      } catch (e) {
        setError(String(e));
      }
    })();
  }, [token]);

  async function patch(partial: Partial<IntakeContent>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (res.ok) {
        setIntake(data.intake);
        setSavedAt(new Date().toLocaleTimeString("pt-PT"));
      } else {
        setError(data.error || `error ${res.status}`);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const completionPct = useMemo(() => {
    if (!intake) return 0;
    let filled = 0;
    if (intake.positioning && intake.positioning.length > 20) filled++;
    if (intake.assets.logoUrl || intake.assets.primaryColor) filled++;
    if (intake.services.length > 0) filled++;
    if (intake.testimonials.length > 0) filled++;
    if (intake.stats.length > 0) filled++;
    if (intake.process.length > 0) filled++;
    if (intake.faq.length > 0) filled++;
    if (intake.gallery.length > 0) filled++;
    if (intake.pricing.length > 0) filled++;
    if (intake.contact.email || intake.contact.phone) filled++;
    return Math.round((filled / 10) * 100);
  }, [intake]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-[#EDEDED] flex items-center justify-center p-6" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="max-w-md text-center">
          <h1 className="text-base font-semibold mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-[#888]">{error}</p>
          <p className="text-xs text-[#666] mt-4">Contacte-nos no email da confirmação para gerar um novo link.</p>
        </div>
      </div>
    );
  }

  if (!meta || !intake) {
    return (
      <div className="min-h-screen bg-black text-[#666] flex items-center justify-center text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#EDEDED]" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#1F1F1F] sticky top-0 bg-black/95 backdrop-blur z-30">
        <div className="max-w-[820px] mx-auto px-5 sm:px-6 py-4">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="font-bold tracking-tight text-base">Flowwwzy<span className="text-[#FAEBE3]">.</span></span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#666]">Intake · {meta.businessName || "novo projeto"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-[#1F1F1F] rounded-full overflow-hidden">
              <div className="h-full bg-[#FAEBE3] transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
            <span className="text-[11px] text-[#888] tabular-nums">{completionPct}%</span>
            {saving && <span className="text-[11px] text-amber-400">A guardar…</span>}
            {savedAt && !saving && <span className="text-[11px] text-emerald-400">Guardado · {savedAt}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-[820px] mx-auto px-5 sm:px-6 py-8 space-y-5">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">Vamos preencher o seu site.</h1>
          <p className="text-sm text-[#888] leading-relaxed">
            Olá {meta.customerName ? meta.customerName.split(" ")[0] : "—"}. Esta página guarda automaticamente, pode voltar quando quiser.
            Quanto mais informação preencher, melhor o resultado final. Pode saltar cards que não se aplicam.
          </p>
        </div>

        {CARD_ORDER.map((key) => (
          <Card key={key} title={CARD_META[key].title} description={CARD_META[key].description} skipped={intake.skipped.includes(key)} onSkipToggle={(s) => {
            const next = s ? [...intake.skipped, key] : intake.skipped.filter((x) => x !== key);
            patch({ skipped: next });
          }}>
            {key === "positioning" && (
              <textarea
                className="input"
                rows={3}
                placeholder="Ex: Estúdio de design de interiores em Lisboa, foco em casas particulares de gama alta."
                defaultValue={intake.positioning || ""}
                onBlur={(e) => patch({ positioning: e.target.value })}
              />
            )}

            {key === "assets" && (
              <div className="space-y-3">
                <Field label="URL do logo (PNG ou SVG)">
                  <input className="input" type="url" placeholder="https://..." defaultValue={intake.assets.logoUrl || ""}
                    onBlur={(e) => patch({ assets: { ...intake.assets, logoUrl: e.target.value } })} />
                </Field>
                <Field label="Cor primária (hex)">
                  <input className="input" type="text" placeholder="#1A1A1A" defaultValue={intake.assets.primaryColor || ""}
                    onBlur={(e) => patch({ assets: { ...intake.assets, primaryColor: e.target.value } })} />
                </Field>
                <Field label="Hero image URL (opcional)">
                  <input className="input" type="url" placeholder="https://..." defaultValue={intake.assets.heroImageUrl || ""}
                    onBlur={(e) => patch({ assets: { ...intake.assets, heroImageUrl: e.target.value } })} />
                </Field>
              </div>
            )}

            {key === "services" && (
              <ListEditor items={intake.services} onChange={(items) => patch({ services: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" placeholder="Título" defaultValue={item.title} onBlur={(e) => set("title", e.target.value)} />
                  <textarea className="input" rows={2} placeholder="Descrição" defaultValue={item.description} onBlur={(e) => set("description", e.target.value)} />
                  <input className="input" placeholder="Preço (opcional)" defaultValue={item.price || ""} onBlur={(e) => set("price", e.target.value)} />
                </>
              )} blank={() => ({ title: "", description: "", price: "" })} addLabel="+ Serviço" />
            )}

            {key === "testimonials" && (
              <ListEditor items={intake.testimonials} onChange={(items) => patch({ testimonials: items })} renderItem={(item, i, set) => (
                <>
                  <textarea className="input" rows={2} placeholder="Quote" defaultValue={item.quote} onBlur={(e) => set("quote", e.target.value)} />
                  <input className="input" placeholder="Autor" defaultValue={item.author} onBlur={(e) => set("author", e.target.value)} />
                  <input className="input" placeholder="Cargo (opcional)" defaultValue={item.role || ""} onBlur={(e) => set("role", e.target.value)} />
                  <input className="input" placeholder="Empresa (opcional)" defaultValue={item.company || ""} onBlur={(e) => set("company", e.target.value)} />
                </>
              )} blank={() => ({ quote: "", author: "", role: "", company: "" })} addLabel="+ Testemunho" />
            )}

            {key === "stats" && (
              <ListEditor items={intake.stats} onChange={(items) => patch({ stats: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" placeholder="Valor (e.g. 94%)" defaultValue={item.value} onBlur={(e) => set("value", e.target.value)} />
                  <input className="input" placeholder="Label" defaultValue={item.label} onBlur={(e) => set("label", e.target.value)} />
                </>
              )} blank={() => ({ value: "", label: "" })} addLabel="+ Métrica" />
            )}

            {key === "process" && (
              <ListEditor items={intake.process} onChange={(items) => patch({ process: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" placeholder="Título do passo" defaultValue={item.title} onBlur={(e) => set("title", e.target.value)} />
                  <textarea className="input" rows={2} placeholder="Descrição" defaultValue={item.description} onBlur={(e) => set("description", e.target.value)} />
                  <input className="input" placeholder="Meta (e.g. Dia 1, Semana 2)" defaultValue={item.meta || ""} onBlur={(e) => set("meta", e.target.value)} />
                </>
              )} blank={() => ({ title: "", description: "", meta: "" })} addLabel="+ Passo" />
            )}

            {key === "faq" && (
              <ListEditor items={intake.faq} onChange={(items) => patch({ faq: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" placeholder="Pergunta" defaultValue={item.question} onBlur={(e) => set("question", e.target.value)} />
                  <textarea className="input" rows={2} placeholder="Resposta" defaultValue={item.answer} onBlur={(e) => set("answer", e.target.value)} />
                </>
              )} blank={() => ({ question: "", answer: "" })} addLabel="+ FAQ" />
            )}

            {key === "gallery" && (
              <ListEditor items={intake.gallery} onChange={(items) => patch({ gallery: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" type="url" placeholder="URL da imagem" defaultValue={item.imageUrl} onBlur={(e) => set("imageUrl", e.target.value)} />
                  <input className="input" placeholder="Caption (opcional)" defaultValue={item.caption || ""} onBlur={(e) => set("caption", e.target.value)} />
                </>
              )} blank={() => ({ imageUrl: "", caption: "" })} addLabel="+ Imagem" />
            )}

            {key === "pricing" && (
              <ListEditor items={intake.pricing} onChange={(items) => patch({ pricing: items })} renderItem={(item, i, set) => (
                <>
                  <input className="input" placeholder="Nome do tier (e.g. Pro)" defaultValue={item.name} onBlur={(e) => set("name", e.target.value)} />
                  <input className="input" placeholder="Preço (e.g. €29)" defaultValue={item.price} onBlur={(e) => set("price", e.target.value)} />
                  <input className="input" placeholder="Período (e.g. /mês)" defaultValue={item.period || ""} onBlur={(e) => set("period", e.target.value)} />
                  <textarea className="input" rows={2} placeholder="Features (uma por linha)"
                    defaultValue={(item.features || []).join("\n")}
                    onBlur={(e) => set("features", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
                </>
              )} blank={() => ({ name: "", price: "", period: "", features: [] })} addLabel="+ Tier" />
            )}

            {key === "contact" && (
              <div className="space-y-3">
                <Field label="Email">
                  <input className="input" type="email" defaultValue={intake.contact.email || ""}
                    onBlur={(e) => patch({ contact: { ...intake.contact, email: e.target.value } })} />
                </Field>
                <Field label="Telefone">
                  <input className="input" type="tel" defaultValue={intake.contact.phone || ""}
                    onBlur={(e) => patch({ contact: { ...intake.contact, phone: e.target.value } })} />
                </Field>
                <Field label="Morada">
                  <input className="input" defaultValue={intake.contact.address || ""}
                    onBlur={(e) => patch({ contact: { ...intake.contact, address: e.target.value } })} />
                </Field>
                <Field label="Redes sociais (uma por linha, formato Instagram=https://...)">
                  <textarea className="input" rows={3}
                    defaultValue={(intake.contact.socialLinks || []).map((s) => `${s.label}=${s.href}`).join("\n")}
                    onBlur={(e) => {
                      const lines = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                      const social = lines.map((l) => {
                        const [label, ...rest] = l.split("=");
                        return { label: label?.trim() || "", href: rest.join("=").trim() };
                      }).filter((s) => s.label && s.href);
                      patch({ contact: { ...intake.contact, socialLinks: social } });
                    }} />
                </Field>
              </div>
            )}
          </Card>
        ))}

        <div className="border-t border-[#1F1F1F] pt-6 mt-8 text-center">
          <p className="text-sm text-[#888]">
            Tudo guardado automaticamente. Pode fechar e voltar a qualquer momento.
          </p>
        </div>
      </main>

      <style>{`
        .input {
          width: 100%;
          background: #0F0F0F;
          border: 1px solid #2A2A2A;
          border-radius: 6px;
          padding: 10px 12px;
          color: #EDEDED;
          font-size: 14px;
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: #666;
        }
      `}</style>
    </div>
  );
}

function Card({
  title,
  description,
  skipped,
  onSkipToggle,
  children,
}: {
  title: string;
  description: string;
  skipped: boolean;
  onSkipToggle: (s: boolean) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className={`border rounded-lg overflow-hidden ${skipped ? "border-[#1F1F1F] opacity-60" : "border-[#2A2A2A]"} bg-[#0A0A0A]`}>
      <header className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-[#1F1F1F]">
        <button onClick={() => setOpen(!open)} className="flex-1 text-left">
          <h2 className="text-base font-semibold text-[#EDEDED]">{title}</h2>
          <p className="text-xs text-[#888] mt-0.5">{description}</p>
        </button>
        <button
          onClick={() => onSkipToggle(!skipped)}
          className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#666] hover:text-[#EDEDED]"
        >
          {skipped ? "Reativar" : "Saltar"}
        </button>
      </header>
      {open && !skipped && <div className="p-5 space-y-3">{children}</div>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.14em] font-semibold text-[#888] mb-2">{label}</span>
      {children}
    </label>
  );
}

function ListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  renderItem,
  blank,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, idx: number, set: (key: keyof T, value: T[keyof T]) => void) => React.ReactNode;
  blank: () => T;
  addLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-[#1F1F1F] rounded p-3 space-y-2 relative">
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="absolute top-2 right-2 text-[#666] hover:text-red-400 text-xs"
            title="Remover"
          >
            ×
          </button>
          {renderItem(item, i, (key, value) => {
            const next = [...items];
            next[i] = { ...next[i], [key]: value };
            onChange(next);
          })}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, blank()])}
        className="w-full px-3 py-2.5 rounded border border-dashed border-[#2A2A2A] text-[#888] text-xs hover:border-[#666] hover:text-[#EDEDED] transition-colors"
      >
        {addLabel}
      </button>
    </div>
  );
}
