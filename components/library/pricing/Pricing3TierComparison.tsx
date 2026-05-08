"use client";

import { Section, Container, ButtonPrimary, Eyebrow } from "../_lib/Container";

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  ctaHref?: string;
  highlighted?: boolean;
  badge?: string;
};

export type Pricing3TierComparisonSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  tiers: PricingTier[];
  footnote?: string;
};

export default function Pricing3TierComparison(props: Pricing3TierComparisonSlots) {
  const { eyebrow, headline, subheadline, tiers, footnote } = props;

  return (
    <Section>
      <Container>
        <div className="max-w-[44ch] mx-auto text-center">
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

        <ul
          className="mt-10 sm:mt-12 md:mt-16 grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-3"
          role="list"
        >
          {tiers.map((t, i) => {
            const isHi = t.highlighted;
            return (
              <li
                key={t.name + i}
                className={`relative rounded-[var(--lib-radius-card)] p-6 sm:p-7 md:p-8 flex flex-col transition-transform duration-300 ease-out ${
                  isHi
                    ? "bg-lib-accent text-lib-accent-foreground md:scale-[1.03] md:-translate-y-1 z-10"
                    : "bg-lib-surface border border-lib-border text-lib-foreground"
                }`}
              >
                {t.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded-full ${
                      isHi
                        ? "bg-lib-accent-foreground text-lib-accent"
                        : "bg-lib-accent text-lib-accent-foreground"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}

                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                    isHi ? "text-lib-accent-foreground/70" : "text-lib-muted"
                  }`}
                >
                  {t.name}
                </span>

                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className="font-lib-display text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em]"
                    style={{ fontWeight: 600 }}
                  >
                    {t.price}
                  </span>
                  {t.period && (
                    <span
                      className={`text-sm sm:text-base ${
                        isHi ? "text-lib-accent-foreground/70" : "text-lib-muted"
                      }`}
                    >
                      {t.period}
                    </span>
                  )}
                </div>

                {t.description && (
                  <p
                    className={`mt-3 text-sm sm:text-base leading-relaxed ${
                      isHi ? "text-lib-accent-foreground/80" : "text-lib-muted"
                    }`}
                  >
                    {t.description}
                  </p>
                )}

                <ul className="mt-6 sm:mt-7 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-3 text-sm sm:text-base ${
                        isHi ? "text-lib-accent-foreground" : "text-lib-foreground/90"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 ${
                          isHi ? "text-lib-accent-foreground" : "text-lib-accent"
                        }`}
                        aria-hidden
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10.5L8 14.5L16 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={t.ctaHref || "#"}
                  className={`mt-7 sm:mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-[8px] text-sm sm:text-base font-semibold transition-transform duration-200 ease-out hover:-translate-y-[1px] ${
                    isHi
                      ? "bg-lib-accent-foreground text-lib-accent"
                      : "bg-lib-foreground text-lib-bg"
                  }`}
                >
                  {t.ctaLabel} →
                </a>
              </li>
            );
          })}
        </ul>

        {footnote && (
          <p className="mt-8 sm:mt-10 text-center text-sm text-lib-muted">{footnote}</p>
        )}
      </Container>
    </Section>
  );
}
