"use client";

import { motion } from "framer-motion";

export default function Founder() {
  return (
    <section className="py-16 md:py-24 spotlight">
      <div className="container-x max-w-[1080px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="card-dark p-6 md:p-10 grid md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] gap-8 md:gap-12 items-center"
        >
          <div
            className="aspect-[4/5] rounded-card overflow-hidden relative"
            style={{
              background:
                "linear-gradient(140deg, #1a1a1a 0%, #050505 100%)",
            }}
          >
            <img
              src="/images/founder.jpg"
              alt="Tomás Massano"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Fallback initials shown if image missing */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-7xl md:text-8xl font-medium opacity-20"
                style={{ letterSpacing: "-0.04em", color: "var(--cream)" }}
              >
                TM
              </span>
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(250,235,227,0.18) 0%, transparent 50%)",
              }}
            />
          </div>

          <div>
            <span className="label">Quem está por trás</span>
            <h2 className="mt-3 text-3xl md:text-5xl" style={{ fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              Tomás <span className="italic-accent">Massano</span>
            </h2>
            <p className="mt-2 text-gray-300 text-body-lg">Founder · Design Lead</p>

            <p className="mt-6 text-gray-300 text-base md:text-body-lg leading-relaxed max-w-[58ch]">
              Construí a Flowwwzy depois de ver demasiados negócios bons a ficarem presos com sites que não os representavam. O Express é como entrego trabalho de estúdio sem o calendário de estúdio. Cada projeto passa por mim antes de sair.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://www.linkedin.com/in/tomasvmassano"
                target="_blank"
                rel="noopener"
                className="btn-dark inline-flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 11.01-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="mailto:tomas@flowwwzy.com"
                className="btn-tertiary"
              >
                tomas@flowwwzy.com
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-divider grid grid-cols-3 gap-4 max-w-[420px]">
              <Stat n="60+" l="Projetos" />
              <Stat n="8 anos" l="Experiência" />
              <Stat n="15+" l="Indústrias" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-medium" style={{ letterSpacing: "-0.02em" }}>{n}</div>
      <div className="text-gray-500 text-body-sm mt-0.5">{l}</div>
    </div>
  );
}
