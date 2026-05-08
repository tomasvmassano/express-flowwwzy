"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Escolha a sua direção",
    body:
      "Escolhe o estilo, as cores, o tom. Mostra-nos 3 sites que adoras. Usamos os teus inputs para criar algo que combina com a tua marca, não um template que serve toda a gente.",
  },
  {
    n: "02",
    title: "Nós desenhamos e construímos",
    body:
      "Uma equipa sénior constrói o teu site em 72 horas. Layout personalizado, copy se precisares, totalmente responsivo, rápido em mobile, pronto a converter.",
  },
  {
    n: "03",
    title: "Revisão, ajustes, lançamento",
    body:
      "Uma ronda de revisões incluída. Quando aprovas, lançamos. Recebes os acessos completos e 14 dias de suporte pós-lançamento.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 relative spotlight">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-[24ch]"
        >
          Três passos. Sete dias no máximo. Um site que é <span className="italic-accent">mesmo seu</span>.
        </motion.h2>

        <div className="mt-16 md:mt-20 grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.165, 0.84, 0.44, 1] }}
              className="card-dark p-8 md:p-10"
            >
              <div className="text-cream text-body-sm font-mono mb-8">{s.n}</div>
              <h3 className="text-h3 mb-4" style={{ fontWeight: 500 }}>{s.title}</h3>
              <p className="text-gray-300 text-base leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="italic-accent text-base md:text-lg mt-12 md:mt-16 max-w-[60ch]"
          style={{ color: "var(--gray-300)" }}
        >
          O nosso processo combina design sénior com um sistema de produção interno alimentado por IA. O resultado: trabalho à medida à velocidade de um template.
        </motion.p>
      </div>
    </section>
  );
}
