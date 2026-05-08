"use client";

import { useState } from "react";
import { Section, Container, Eyebrow } from "../_lib/Container";

export type SingleTestimonial = {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  /** Optional logo of the author's company shown small on the right */
  logoUrl?: string;
};

export type TestimonialsSingleNavigatedSlots = {
  eyebrow?: string;
  testimonials: SingleTestimonial[];
};

export default function TestimonialsSingleNavigated(props: TestimonialsSingleNavigatedSlots) {
  const { eyebrow, testimonials } = props;
  const [active, setActive] = useState(0);

  if (testimonials.length === 0) return null;
  const t = testimonials[active];
  const total = testimonials.length;

  const prev = () => setActive((i) => (i - 1 + total) % total);
  const next = () => setActive((i) => (i + 1) % total);

  return (
    <Section>
      <Container width="narrow">
        {eyebrow && (
          <div className="text-center mb-8 sm:mb-10">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        )}

        <blockquote
          key={active}
          className="text-center animate-[libQuoteFade_400ms_cubic-bezier(.165,.84,.44,1)_both]"
          aria-live="polite"
        >
          <p
            className="font-lib-display text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.25] tracking-[-0.015em] text-lib-foreground"
            style={{ fontWeight: 500 }}
          >
            &ldquo;{t.quote}&rdquo;
          </p>

          <footer className="mt-8 sm:mt-10 flex items-center justify-center gap-3 sm:gap-4">
            {t.avatarUrl && (
              <img
                src={t.avatarUrl}
                alt=""
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-lib-border"
              />
            )}
            <div className="text-left">
              <div className="text-sm sm:text-base font-semibold text-lib-foreground">{t.author}</div>
              {(t.role || t.company) && (
                <div className="text-xs sm:text-sm text-lib-muted">
                  {[t.role, t.company].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            {t.logoUrl && (
              <>
                <span className="hidden sm:block w-px h-8 bg-lib-border mx-2" aria-hidden />
                <img
                  src={t.logoUrl}
                  alt=""
                  className="hidden sm:block max-h-7 w-auto opacity-70"
                />
              </>
            )}
          </footer>
        </blockquote>

        {/* Nav controls */}
        {total > 1 && (
          <div className="mt-10 sm:mt-12 flex items-center justify-between">
            <span className="text-xs sm:text-sm tabular-nums text-lib-muted font-semibold">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Testemunho anterior"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-lib-border text-lib-muted hover:text-lib-foreground hover:border-lib-accent transition-colors duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lib-accent"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Testemunho seguinte"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-lib-border text-lib-muted hover:text-lib-foreground hover:border-lib-accent transition-colors duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lib-accent"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </Container>

      <style>{`
        @keyframes libQuoteFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Section>
  );
}
