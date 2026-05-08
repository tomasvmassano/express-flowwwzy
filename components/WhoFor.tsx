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
  return (
    <section className="py-20 md:py-28">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        >
          Isto é <span className="italic-accent">para si</span>?
        </motion.h2>

        <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
            className="card-dark p-7 md:p-10"
          >
            <h3 className="text-h3 mb-7" style={{ fontWeight: 500 }}>
              Sim, isto é para si <span className="italic-accent">se...</span>
            </h3>
            <ul className="space-y-5">
              {yes.map((item) => (
                <li key={item} className="flex items-start gap-3.5 text-base text-gray-300">
                  <Check />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
            className="card-dark p-7 md:p-10"
          >
            <h3 className="text-h3 mb-7" style={{ fontWeight: 500 }}>
              Não, isto não é para si se...
            </h3>
            <ul className="space-y-5">
              {no.map((item) => (
                <li key={item} className="flex items-start gap-3.5 text-base text-gray-500">
                  <Cross />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cream/15 flex items-center justify-center mt-0.5">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 10.5L8 14.5L16 6.5" stroke="#FAEBE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Cross() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-divider flex items-center justify-center mt-0.5">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M2 2L8 8M8 2L2 8" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
