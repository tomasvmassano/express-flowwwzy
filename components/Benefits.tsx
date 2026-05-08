"use client";

import { motion } from "framer-motion";

const benefits = [
  {
    title: "Online em dias, não em meses",
    body: "Express Page em 48-72h. Site completo em 5 dias. Brand completa em 7 dias. O calendário é firme — não promessas que escorregam para o trimestre seguinte.",
    icon: "clock",
  },
  {
    title: "Preço fechado, do início ao fim",
    body: "€490, €890 ou €1.490. Sem orçamentos por hora. Sem extras a meio do projeto. Sabe ao cêntimo quanto vai pagar antes de começarmos.",
    icon: "tag",
  },
  {
    title: "Design à medida, pensado para vender",
    body: "Cada secção é desenhada para o seu negócio, não tirada de um template. Mobile-first, rápido, otimizado para conversão e com SEO básico de raiz.",
    icon: "spark",
  },
  {
    title: "Risco zero — garantia de 14 dias",
    body: "Tem direito a uma ronda de revisões incluída. Se mesmo assim não gostar, devolvemos 100% do valor em 14 dias. Sem perguntas.",
    icon: "shield",
  },
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-24 spotlight">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-none"
        >
          <span className="label">O que muda para si</span>
          <h2 className="mt-4 max-w-[22ch] md:max-w-[36ch] text-balance">
            Trabalho de estúdio, <span className="italic-accent">sem o calendário</span> de estúdio.
          </h2>
        </motion.div>

        <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-5 md:gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 2) * 0.08, ease: [0.165, 0.84, 0.44, 1] }}
              className="card-dark p-7 md:p-9 flex gap-5 md:gap-7"
            >
              <span className="flex-shrink-0 w-12 h-12 rounded-card border border-divider flex items-center justify-center text-cream">
                <BenefitIcon name={b.icon} />
              </span>
              <div>
                <h3 className="text-h3 mb-3" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>
                  {b.title}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed">{b.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitIcon({ name }: { name: string }) {
  const stroke = "currentColor";
  const sw = 1.5;
  switch (name) {
    case "clock":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
          <path d="M12 7v5l3.5 2.2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "tag":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12V4h8l9 9-8 8-9-9z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx="7.5" cy="7.5" r="1.4" fill={stroke} />
        </svg>
      );
    case "spark":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5"
            stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3l8 3v6c0 4.5-3.4 8.6-8 9.5C7.4 20.6 4 16.5 4 12V6l8-3z"
            stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
