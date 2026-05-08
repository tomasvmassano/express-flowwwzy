"use client";

import Logo from "./Logo";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Hero() {
  const [playing, setPlaying] = useState(false);
  const embedUrl = process.env.NEXT_PUBLIC_VSL_EMBED_URL;
  const posterUrl = process.env.NEXT_PUBLIC_VSL_POSTER_URL || "/images/vsl-poster.jpg";

  const scrollToConfigurator = () =>
    document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToPortfolio = () =>
    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="relative spotlight pt-8 md:pt-12 pb-16 md:pb-20 overflow-hidden">
      {/* Top bar */}
      <div className="container-x flex items-center justify-between mb-10 md:mb-14">
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

      {/* Headline + sub-line — tight, one-line subhead so the video stays prominent */}
      <div className="container-x text-center max-w-[940px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.165, 0.84, 0.44, 1] }}
          className="label inline-block"
        >
          Express · Productized Web Design
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-5 max-w-[20ch] mx-auto"
        >
          Um site profissional. Pronto em <span className="italic-accent">3 dias</span>. Desde €490.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.165, 0.84, 0.44, 1] }}
          className="mt-6 text-gray-300 text-body-lg max-w-[60ch] mx-auto"
        >
          Design à medida, feito por uma equipa sénior. Sem reuniões. Sem propostas de €8.000. Sem esperar 3 meses.
        </motion.p>
      </div>

      {/* Video — the protagonist of the fold */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
        className="container-x mt-10 md:mt-14"
      >
        <div
          className="card-dark overflow-hidden relative max-w-[1100px] mx-auto"
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
              {/* Poster image — hidden silently if missing */}
              <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Fallback texture */}
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
                    "radial-gradient(circle at 30% 30%, rgba(250,235,227,0.18) 0%, transparent 55%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none" />

              {/* Play */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-cream text-black transition-transform duration-300 group-hover:scale-105">
                  <span
                    className="absolute inset-0 rounded-full bg-cream/40 animate-ping"
                    style={{ animationDuration: "2.4s" }}
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13l11-6.5L8 5.5z" />
                  </svg>
                </span>
              </span>

              {/* Caption */}
              <span className="absolute bottom-5 md:bottom-8 left-5 md:left-10 right-5 md:right-10 flex items-end justify-between gap-4 text-left">
                <span
                  className="text-white font-semibold text-base md:text-2xl"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {embedUrl ? "Ver apresentação · 90s" : "Vídeo a ser preparado"}
                </span>
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* CTA + refund line */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.165, 0.84, 0.44, 1] }}
        className="container-x mt-10 md:mt-12 text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
          <button onClick={scrollToConfigurator} className="btn-primary text-base">
            Começar o meu site →
          </button>
          <button onClick={scrollToPortfolio} className="btn-tertiary">
            Ver trabalho
          </button>
        </div>
        <p className="mt-5 text-body-sm text-gray-500">
          Sem reuniões. Sem chamadas. Garantia de devolução de 14 dias.
        </p>
      </motion.div>

      {/* Stats — closes the fold and reinforces "real human studio" */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="container-x mt-16 md:mt-20"
      >
        <div className="grid sm:grid-cols-3 gap-6 md:gap-10 max-w-[1100px] mx-auto">
          {[
            { v: "8 anos", l: "a construir sites para marcas em Portugal e MENA" },
            { v: "60+", l: "projetos entregues, todos liderados pela mesma equipa" },
            { v: "0", l: "agências subcontratadas. Fala diretamente connosco" },
          ].map((s) => (
            <div key={s.l} className="border-t border-divider pt-5 text-center sm:text-left">
              <div className="text-3xl md:text-4xl font-medium" style={{ letterSpacing: "-0.02em" }}>
                {s.v}
              </div>
              <div className="text-gray-500 text-body-sm mt-1.5 leading-snug">{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
