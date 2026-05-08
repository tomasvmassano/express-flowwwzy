"use client";

import { motion } from "framer-motion";

const yes = [
  "Precisa de um site profissional sem o calendário de uma agência",
  "Quer trabalho à medida, não um template Wix",
  "Consegue descrever o que quer sem 5 reuniões",
  "Está pronto para avançar rápido",
];

const no = [
  "Precisa de 50 stakeholders para aprovar uma cor",
  "Quer revisões ilimitadas e prazos infinitos",
  "Ainda está a tentar perceber se o seu negócio faz sentido",
  "Procura o orçamento mais barato no Fiverr",
];

export default function WhoFor() {
  const scrollToConfigurator = () => {
    document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <div className="max-w-[24ch]">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="label inline-block"
          >
            Honestidade primeiro
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
            className="mt-4"
          >
            Isto é <span className="italic-accent">para si</span>?
          </motion.h2>
        </div>

        <div className="mt-12 md:mt-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8 items-stretch">
          {/* YES — white island, dominant */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
            className="white-island p-8 md:p-12 lg:p-14 relative overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10.5L8 14.5L16 6.5" stroke="#ECECEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span
                className="text-xs font-bold uppercase tracking-[0.16em]"
                style={{ color: "#000" }}
              >
                Bem-vindo a bordo
              </span>
            </div>

            <h3
              className="text-3xl md:text-5xl mb-10"
              style={{ fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05, color: "#000" }}
            >
              Sim, é <span className="italic-accent" style={{ color: "#000" }}>para si</span> se reconhece isto.
            </h3>

            <ul className="space-y-5 flex-1">
              {yes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 text-base md:text-lg"
                  style={{ color: "#000" }}
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black flex items-center justify-center mt-0.5">
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden>
                      <path d="M4 10.5L8 14.5L16 6.5" stroke="#ECECEC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span style={{ letterSpacing: "-0.005em" }}>{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={scrollToConfigurator}
              className="mt-10 inline-flex self-start items-center gap-2 bg-black text-white font-semibold px-6 py-3.5 rounded-[8px] transition-colors duration-200 hover:bg-[#222]"
            >
              Começar agora →
            </button>
          </motion.div>

          {/* NO — muted dark, secondary */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
            className="card-dark p-7 md:p-9 flex flex-col"
            style={{ background: "#0A0A0A" }}
          >
            <div className="flex items-center gap-3 mb-7">
              <span className="inline-flex w-9 h-9 rounded-full bg-divider flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 3L11 11M11 3L3 11" stroke="#757575" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="label">Talvez não seja para si</span>
            </div>

            <h3
              className="text-2xl md:text-3xl mb-8 text-gray-300"
              style={{ fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}
            >
              Provavelmente não é para si se...
            </h3>

            <ul className="space-y-4 flex-1">
              {no.map((item) => (
                <li key={item} className="flex items-start gap-3 text-body-sm md:text-base text-gray-500">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-divider mt-0.5" />
                  <span className="line-through decoration-divider">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-body-sm text-gray-500 italic border-t border-divider pt-5">
              Sem dramas. Não tentamos servir toda a gente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
