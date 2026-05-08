"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type ExpandedService = {
  title: string;
  description: string;
  /** Optional sub-bullets shown when the row is open (e.g. capabilities list) */
  capabilities?: string[];
  /** Optional related links shown on the right column when the row is open */
  resources?: { label: string; href?: string; meta?: string }[];
};

export type ServicesNumberedExpandedSlots = {
  eyebrow?: string;
  headline: string;
  services: ExpandedService[];
  /** Index of the row that should start open. Defaults to 0. */
  defaultOpen?: number;
};

export default function ServicesNumberedExpanded(props: ServicesNumberedExpandedSlots) {
  const { eyebrow, headline, services, defaultOpen = 0 } = props;

  return (
    <Section>
      <Container>
        <div className="max-w-[44ch] mb-10 sm:mb-12 md:mb-16">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2
            className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground"
            style={{ fontWeight: 600 }}
          >
            {headline}
          </h2>
        </div>

        <ul className="border-t border-lib-border" role="list">
          {services.map((s, i) => (
            <li key={s.title + i} className="border-b border-lib-border">
              <details open={i === defaultOpen} className="group">
                <summary className="cursor-pointer list-none flex items-baseline gap-4 sm:gap-6 py-5 sm:py-6 md:py-7 outline-none">
                  <span className="text-xs sm:text-sm tabular-nums text-lib-muted font-semibold w-7 sm:w-10 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-lib-display text-lg sm:text-xl md:text-2xl text-lib-foreground tracking-[-0.01em] flex-1"
                    style={{ fontWeight: 500 }}
                  >
                    {s.title}
                  </span>
                  <span
                    className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-lib-border flex items-center justify-center text-lib-muted group-open:rotate-45 group-open:border-lib-accent group-open:text-lib-accent transition-all duration-300 ease-out"
                    aria-hidden
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>

                <div className="pb-7 sm:pb-9 md:pb-10 pl-11 sm:pl-16 pr-2 sm:pr-12">
                  <div className="grid gap-6 sm:gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
                    {/* Description */}
                    <p className="text-sm sm:text-base text-lib-foreground/85 leading-relaxed">
                      {s.description}
                    </p>

                    {/* Capabilities */}
                    {s.capabilities && s.capabilities.length > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-lib-muted mb-3">
                          Capacidades
                        </p>
                        <ul className="space-y-1.5 text-sm text-lib-foreground/80">
                          {s.capabilities.map((c) => (
                            <li key={c} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-lib-accent flex-shrink-0" aria-hidden />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Resources */}
                    {s.resources && s.resources.length > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-lib-muted mb-3">
                          Recursos
                        </p>
                        <ul className="space-y-3 text-sm">
                          {s.resources.map((r) => (
                            <li key={r.label}>
                              <a
                                href={r.href || "#"}
                                className="block group/r"
                              >
                                <span className="block text-lib-foreground group-hover/r:text-lib-accent transition-colors duration-200">
                                  {r.label}
                                </span>
                                {r.meta && (
                                  <span className="block text-xs text-lib-muted mt-0.5">{r.meta}</span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
