"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type Service = {
  title: string;
  description: string;
  /** Optional small label/number rendered above the title (e.g. "01", "Strategy") */
  label?: string;
};

export type ServicesGrid3ColSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  services: Service[];
};

export default function ServicesGrid3Col(props: ServicesGrid3ColSlots) {
  const { eyebrow, headline, subheadline, services } = props;

  return (
    <Section>
      <Container>
        {/* Header */}
        <div className="max-w-[44ch]">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2
            className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground"
            style={{ fontWeight: 600 }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 text-base sm:text-lg text-lib-muted leading-relaxed">{subheadline}</p>
          )}
        </div>

        {/* Grid */}
        <ul
          className="mt-10 sm:mt-12 md:mt-14 grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {services.map((s, i) => (
            <li
              key={s.title + i}
              className="group bg-lib-surface border border-lib-border rounded-[var(--lib-radius-card)] p-6 sm:p-7 md:p-8 transition-colors duration-300 ease-out hover:border-lib-accent/40"
            >
              {(s.label || true) && (
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-lib-muted font-semibold">
                    {s.label || String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-lib-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden
                  />
                </div>
              )}
              <h3
                className="font-lib-display text-lg sm:text-xl md:text-2xl tracking-[-0.01em] text-lib-foreground"
                style={{ fontWeight: 600 }}
              >
                {s.title}
              </h3>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-lib-muted leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
