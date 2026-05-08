"use client";

import { motion } from "framer-motion";

const projects = [
  {
    name: "Santa Justa Restaurante",
    category: "Restauração",
    quote: "Identidade digital que reflete a alma do restaurante.",
    color: "#2A1810",
    accent: "#C9A876",
  },
  {
    name: "SFBA Advogados",
    category: "Serviços jurídicos",
    quote: "Presença online à altura da firma.",
    color: "#0E1B2C",
    accent: "#4A7DAB",
  },
  {
    name: "Kech Pics",
    category: "Fotografia & Criativos",
    quote: "Você transformou a nossa marca. Conseguimos duplicar a base de clientes.",
    author: "Omar Abouzrar",
    color: "#1A1A2E",
    accent: "#FAEBE3",
  },
  {
    name: "Dental Crafters",
    category: "Saúde & Clínicas",
    quote: "Uma marca que comunica confiança e modernidade.",
    color: "#0F2027",
    accent: "#88C8E0",
  },
  {
    name: "A Merendeira",
    category: "Comércio local",
    quote: "Site rápido, claro, e que vende todos os dias.",
    color: "#2D1B14",
    accent: "#E8B871",
  },
  {
    name: "Herdade dos Moreiros",
    category: "Hospitalidade & Turismo",
    quote: "Da experiência rural à experiência digital.",
    color: "#1F2920",
    accent: "#A8B89A",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 md:py-28 relative">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-[20ch]"
        >
          Sites <span className="italic-accent">reais</span>. Negócios reais. Entregues rápido.
        </motion.h2>

        <div className="mt-14 md:mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.165, 0.84, 0.44, 1] }}
              className="card-dark overflow-hidden group"
              data-cursor="view"
            >
              <div
                className="aspect-[4/3] relative overflow-hidden"
                style={{
                  background: `linear-gradient(140deg, ${p.color} 0%, #050505 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-50 group-hover:opacity-70 transition-opacity duration-500"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, ${p.accent}30 0%, transparent 50%)`,
                  }}
                />
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.accent, opacity: 0.6 }} />
                    <span className="w-2 h-2 rounded-full bg-divider" />
                    <span className="w-2 h-2 rounded-full bg-divider" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">live</span>
                </div>
                <div className="absolute bottom-6 left-6">
                  <div className="text-white font-semibold text-2xl mb-1" style={{ letterSpacing: "-0.01em" }}>
                    {p.name.split(" ")[0]}
                  </div>
                  <div className="h-px w-12" style={{ background: p.accent, opacity: 0.6 }} />
                </div>
              </div>
              <div className="p-6 md:p-7">
                <div className="flex items-baseline justify-between mb-3 gap-3">
                  <h3 className="text-base font-semibold" style={{ letterSpacing: "-0.01em" }}>
                    {p.name}
                  </h3>
                  <span className="label" style={{ fontSize: "10px" }}>
                    {p.category}
                  </span>
                </div>
                <p className="text-gray-300 text-body-sm leading-relaxed italic">"{p.quote}"</p>
                {p.author && <p className="text-gray-500 text-body-sm mt-2">— {p.author}</p>}
                <a className="mt-5 inline-flex text-body-sm text-cream link-underline" href="#">
                  Ver projeto →
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-16 md:mt-20 border-t border-b border-divider py-8 md:py-10"
        >
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-4 text-center md:text-left">
            {[
              { v: "60+", l: "projetos entregues" },
              { v: "4.7/5", l: "satisfação" },
              { v: "15+", l: "indústrias" },
              { v: "14 dias", l: "garantia" },
            ].map((s) => (
              <div key={s.l} className="flex flex-col items-center md:items-start">
                <div className="text-3xl md:text-4xl font-medium" style={{ letterSpacing: "-0.02em" }}>
                  {s.v}
                </div>
                <div className="text-gray-500 text-body-sm mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
