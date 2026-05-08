"use client";

import Logo from "./Logo";
import { motion } from "framer-motion";

const screenshots = [
  { name: "Santa Justa", category: "Restauração", color: "#2A1810" },
  { name: "Kech Pics", category: "Fotografia", color: "#1A1A2E" },
  { name: "Dental Crafters", category: "Saúde", color: "#0F2027" },
  { name: "SFBA Advogados", category: "Jurídico", color: "#1B1B2F" },
  { name: "A Merendeira", category: "Comércio", color: "#2D1B14" },
  { name: "Herdade dos Moreiros", category: "Hospitalidade", color: "#1F2937" },
];

const trustLogos = ["Tech Fusion", "Informal Labs", "Kech Pics", "Deserve", "Santa Justa", "SFBA"];

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

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 md:mt-20 border-t border-divider pt-8"
        >
          <p className="text-body-sm text-gray-500 mb-5">
            Construído pela equipa por trás da <span className="text-white">Flowwwzy</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
            {trustLogos.map((name) => (
              <span
                key={name}
                className="text-gray-300 text-base md:text-lg font-semibold opacity-60 hover:opacity-100 transition-opacity duration-300"
                style={{ letterSpacing: "-0.01em" }}
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Marquee of project screenshots */}
      <div className="mt-16 md:mt-24 marquee">
        <div className="marquee-track gap-6 px-4">
          {[...screenshots, ...screenshots].map((s, i) => (
            <ProjectCard key={i} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ name, category, color }: { name: string; category: string; color: string }) {
  return (
    <div className="card-dark overflow-hidden flex-shrink-0 w-[320px] md:w-[420px]" data-cursor="view">
      <div
        className="relative aspect-[16/10] flex items-end p-5"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, #050505 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(250,235,227,0.18) 0%, transparent 40%)",
        }} />
        <div className="absolute top-4 left-4 right-4 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-divider" />
          <span className="w-2 h-2 rounded-full bg-divider" />
          <span className="w-2 h-2 rounded-full bg-divider" />
        </div>
        <div className="relative">
          <div className="text-white font-semibold text-lg">{name}</div>
          <div className="text-gray-500 text-body-sm">{category}</div>
        </div>
      </div>
    </div>
  );
}
