"use client";

import { motion } from "framer-motion";

type Project = {
  slug: string;
  name: string;
  category: string;
  url?: string;
  color: string;
  accent: string;
};

const projects: Project[] = [
  { slug: "santa-justa", name: "Santa Justa", category: "Restauração", color: "#2A1810", accent: "#C9A876" },
  { slug: "sfba-advogados", name: "SFBA Advogados", category: "Serviços jurídicos", color: "#0E1B2C", accent: "#4A7DAB" },
  { slug: "kech-pics", name: "Kech Pics", category: "Fotografia & Criativos", color: "#1A1A2E", accent: "#FAEBE3" },
  { slug: "dental-crafters", name: "Dental Crafters", category: "Saúde & Clínicas", color: "#0F2027", accent: "#88C8E0" },
  { slug: "a-merendeira", name: "A Merendeira", category: "Comércio local", color: "#2D1B14", accent: "#E8B871" },
  { slug: "herdade-dos-moreiros", name: "Herdade dos Moreiros", category: "Hospitalidade & Turismo", color: "#1F2920", accent: "#A8B89A" },
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
              key={p.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.165, 0.84, 0.44, 1] }}
              className="card-dark overflow-hidden group"
              data-cursor="view"
            >
              <div
                className="aspect-[4/3] relative overflow-hidden"
                style={{ background: `linear-gradient(140deg, ${p.color} 0%, #050505 100%)` }}
              >
                {/* Real image — fails silently to gradient if file missing */}
                <img
                  src={`/images/projects/${p.slug}.jpg`}
                  alt={`${p.name} — ${p.category}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* Decorative overlay shows when image is missing or for tone */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundImage: `radial-gradient(circle at 25% 25%, ${p.accent}30 0%, transparent 55%)` }}
                />
              </div>
              <div className="p-6 md:p-7 flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold" style={{ letterSpacing: "-0.01em" }}>
                    {p.name}
                  </h3>
                  <span className="text-gray-500 text-body-sm mt-0.5 block">{p.category}</span>
                </div>
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener"
                    className="text-body-sm text-cream link-underline whitespace-nowrap"
                  >
                    Ver projeto →
                  </a>
                ) : (
                  <span className="text-body-sm text-gray-500 whitespace-nowrap">Em destaque</span>
                )}
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
