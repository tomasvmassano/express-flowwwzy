"use client";

import { motion } from "framer-motion";

export default function FinalCTA() {
  const start = () => {
    document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const seePricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-20 md:py-28 spotlight relative">
      <div className="container-x max-w-[920px] text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="label inline-block"
        >
          Última paragem
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-5 max-w-[20ch] mx-auto"
        >
          Pronto para ter o seu site online <span className="italic-accent">esta semana</span>?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-7 text-gray-300 text-body-lg max-w-[58ch] mx-auto"
        >
          Sem reuniões. Sem propostas. Sem esperar 3 meses. 3 minutos para construir a sua direção e ver o resultado antes de pagar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
        >
          <button onClick={start} className="btn-primary text-base">
            Começar o meu site →
          </button>
          <button onClick={seePricing} className="btn-tertiary">
            Rever os pacotes
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-7 text-gray-500 text-body-sm"
        >
          Garantia de devolução de 14 dias · Pagamento único, de €490 a €1.490
        </motion.p>
      </div>
    </section>
  );
}
