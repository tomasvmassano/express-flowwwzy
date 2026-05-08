"use client";

import Logo from "./Logo";
import { motion } from "framer-motion";

export default function Hero() {
  const scrollToConfigurator = () => {
    document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative spotlight pt-8 md:pt-12 pb-16 md:pb-24 overflow-hidden">
      {/* Top bar with by Flowwwzy */}
      <div className="container-x flex items-center justify-between mb-12 md:mb-20">
        <div className="flex items-baseline gap-2">
          <Logo />
          <span className="text-gray-500 text-sm">Express</span>
        </div>
        <a
          href="https://flowwwzy.com"
          target="_blank"
          rel="noopener"
          className="text-gray-500 text-sm hover:text-white transition-colors duration-300 link-underline"
        >
          by Flowwwzy →
        </a>
      </div>

      {/* Hero copy */}
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-[16ch] md:max-w-[18ch]"
        >
          <span className="label">Express · Productized Web Design</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-6 max-w-[22ch]"
        >
          Um site profissional. Pronto em <span className="italic-accent">3 dias</span>.<br className="hidden md:block" /> Desde €490.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-8 text-gray-300 text-body-lg max-w-[58ch]"
        >
          Design à medida, feito por uma equipa sénior, entregue à velocidade que o seu negócio precisa. Sem reuniões. Sem propostas de €8.000. Sem esperar 3 meses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
        >
          <button onClick={scrollToConfigurator} className="btn-primary text-base">
            Começar o meu site →
          </button>
          <button
            onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-tertiary"
          >
            Ver trabalho
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-5 text-body-sm text-gray-500"
        >
          Sem reuniões. Sem chamadas. Garantia de devolução de 14 dias.
        </motion.p>
      </div>
    </section>
  );
}
