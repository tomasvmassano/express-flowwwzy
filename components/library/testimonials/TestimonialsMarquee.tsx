"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type MarqueeQuote = {
  quote: string;
  author: string;
  role?: string;
};

export type TestimonialsMarqueeSlots = {
  eyebrow?: string;
  headline?: string;
  testimonials: MarqueeQuote[];
};

export default function TestimonialsMarquee(props: TestimonialsMarqueeSlots) {
  const { eyebrow, headline, testimonials } = props;

  if (testimonials.length === 0) return null;
  const doubled = [...testimonials, ...testimonials];

  return (
    <Section className="overflow-hidden">
      <Container width="wide">
        {(eyebrow || headline) && (
          <div className="text-center max-w-[44ch] mx-auto mb-10 sm:mb-12 md:mb-14">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {headline && (
              <h2
                className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground"
                style={{ fontWeight: 600 }}
              >
                {headline}
              </h2>
            )}
          </div>
        )}
      </Container>

      {/* Bleeds outside container for full-width scroll effect */}
      <div className="group relative">
        {/* Edge fades */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10"
          style={{ background: "linear-gradient(to right, var(--lib-bg), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10"
          style={{ background: "linear-gradient(to left, var(--lib-bg), transparent)" }}
        />

        <div
          className="flex gap-4 sm:gap-5 md:gap-6 will-change-transform animate-[libMarquee_60s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animation-none"
          style={{ width: "max-content" }}
        >
          {doubled.map((t, i) => (
            <article
              key={i}
              className="flex-shrink-0 w-[280px] sm:w-[360px] md:w-[420px] bg-lib-surface border border-lib-border rounded-[var(--lib-radius-card)] p-5 sm:p-6 md:p-7"
            >
              <p className="text-sm sm:text-base text-lib-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 sm:mt-5 pt-4 border-t border-lib-border">
                <div className="text-sm font-semibold text-lib-foreground">{t.author}</div>
                {t.role && <div className="text-xs text-lib-muted mt-0.5">{t.role}</div>}
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes libMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </Section>
  );
}
