"use client";

import { motion } from "framer-motion";
import { Tier, TIERS } from "@/lib/types";
import { useForm } from "@/lib/store";
import { track } from "@/lib/analytics";

const tiers: {
  id: Tier;
  name: string;
  price: number;
  features: string[];
  ideal: string;
  popular?: boolean;
}[] = [
  {
    id: "page",
    name: "Express Page",
    price: 490,
    features: [
      "Landing page única",
      "5-7 secções de alta conversão",
      "Design 100% à medida",
      "Mobile-first e otimizado",
      "Entrega em 48-72h",
    ],
    ideal: "Ideal para: lançamentos, captação de leads, freelancers",
  },
  {
    id: "site",
    name: "Express Site",
    price: 890,
    features: [
      "Site completo até 5 páginas",
      "Design 100% à medida",
      "Copywriting incluído",
      "SEO básico configurado",
      "1 ronda de revisões",
      "Entrega em 5 dias",
    ],
    ideal: "Ideal para: pequenos negócios, profissionais, restauração, clínicas",
    popular: true,
  },
  {
    id: "backoffice",
    name: "Express Backoffice",
    price: 1490,
    features: [
      "Tudo no Express Site",
      "Backoffice à medida (gestão de leads, clientes ou conteúdo)",
      "Login seguro e área privada",
      "Integração com o site",
      "Até 7 páginas no site",
      "Entrega em 10 dias",
    ],
    ideal: "Ideal para: negócios que precisam de site + ferramenta interna para operar",
  },
];

export default function Pricing() {
  const { setField, goto } = useForm();

  const choose = (tier: Tier) => {
    setField("tier", tier);
    track("ViewContent", { tier, value: TIERS[tier].price, currency: "EUR" });
    goto(1);
    setTimeout(
      () => document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40
    );
  };

  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-[20ch]"
        >
          Escolha o que <span className="italic-accent">faz sentido</span> para o seu negócio.
        </motion.h2>

        <div className="mt-14 md:mt-20 grid md:grid-cols-3 gap-6 md:gap-7">
          {tiers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.165, 0.84, 0.44, 1] }}
              className={`relative card-dark p-7 md:p-9 flex flex-col ${
                t.popular ? "md:scale-[1.03] md:-translate-y-1" : ""
              }`}
              style={
                t.popular
                  ? {
                      borderColor: "var(--cream)",
                      boxShadow: "0 0 0 1px var(--cream), 0 24px 80px -32px rgba(250,235,227,0.18)",
                    }
                  : undefined
              }
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 popular-badge">Mais Popular</div>
              )}

              <div className="text-cream label mb-4" style={{ color: "var(--gray-500)" }}>
                {t.name}
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl md:text-6xl font-medium" style={{ letterSpacing: "-0.03em" }}>
                  €{t.price}
                </span>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-body-sm md:text-base">
                    <CheckIcon />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <p className="text-body-sm text-gray-500 mb-6">{t.ideal}</p>

              <button
                onClick={() => choose(t.id)}
                className={t.popular ? "btn-primary w-full" : "btn-dark w-full"}
              >
                Escolher esta opção →
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-body-sm mt-10">
          Pagamento único. Sem subscrições. Garantia de devolução de 14 dias.
        </p>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden>
      <path
        d="M4 10.5L8 14.5L16 6.5"
        stroke="#FAEBE3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
