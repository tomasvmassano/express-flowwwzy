"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const embedUrl = process.env.NEXT_PUBLIC_VSL_EMBED_URL;
  const posterUrl = process.env.NEXT_PUBLIC_VSL_POSTER_URL || "/images/vsl-poster.jpg";

  return (
    <section className="py-20 md:py-28 spotlight">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="max-w-[28ch]"
        >
          <span className="label">90 segundos</span>
          <h2 className="mt-4">
            Veja como funciona, <span className="italic-accent">cara a cara</span>.
          </h2>
          <p className="mt-6 text-gray-300 text-body-lg max-w-[52ch]">
            Quem está por trás, como entregamos em dias, e exemplos reais do trabalho. Mais rápido do que ler a página inteira.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-12 md:mt-16 card-dark overflow-hidden relative"
          style={{ aspectRatio: "16 / 9" }}
        >
          {playing && embedUrl ? (
            <iframe
              src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title="Flowwwzy Express — vídeo de apresentação"
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => embedUrl && setPlaying(true)}
              className="absolute inset-0 w-full h-full group"
              aria-label={embedUrl ? "Reproduzir vídeo" : "Vídeo a ser preparado"}
            >
              {/* Poster image — falls back to the gradient/initials underneath if missing */}
              <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Fallback texture if no poster */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, #1a1a1a 0%, #050505 100%)",
                  zIndex: -1,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgba(250,235,227,0.16) 0%, transparent 55%)",
                }}
              />
              {/* Gradient overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Play button */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-cream text-black transition-transform duration-300 group-hover:scale-105">
                  <span className="absolute inset-0 rounded-full bg-cream/40 animate-ping" style={{ animationDuration: "2.4s" }} />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13l11-6.5L8 5.5z" />
                  </svg>
                </span>
              </span>

              {/* Caption */}
              <span className="absolute bottom-5 md:bottom-8 left-5 md:left-10 right-5 md:right-10 flex items-end justify-between gap-4 text-left">
                <span className="text-white font-semibold text-lg md:text-2xl" style={{ letterSpacing: "-0.01em" }}>
                  {embedUrl ? "Ver apresentação · 90s" : "Vídeo a ser preparado"}
                </span>
                {!embedUrl && (
                  <span className="text-body-sm text-gray-300 hidden md:inline">
                    Defina <code className="text-cream">NEXT_PUBLIC_VSL_EMBED_URL</code> para ativar
                  </span>
                )}
              </span>
            </button>
          )}
        </motion.div>

        {/* Reinforcement strip — humans, not a bot studio */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 md:mt-14 grid sm:grid-cols-3 gap-6 md:gap-8 text-center sm:text-left"
        >
          {[
            { v: "8 anos", l: "a construir sites para marcas em Portugal e MENA" },
            { v: "60+", l: "projetos entregues, todos liderados pela mesma equipa" },
            { v: "0", l: "agências subcontratadas. Falamos diretamente consigo" },
          ].map((s) => (
            <div key={s.l} className="border-t border-divider pt-5">
              <div className="text-3xl md:text-4xl font-medium" style={{ letterSpacing: "-0.02em" }}>
                {s.v}
              </div>
              <div className="text-gray-500 text-body-sm mt-1.5 leading-snug">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
