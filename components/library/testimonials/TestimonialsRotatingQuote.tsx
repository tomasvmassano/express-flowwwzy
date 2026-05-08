"use client";

import { useEffect, useState } from "react";
import { Section, Container, Eyebrow } from "../_lib/Container";

export type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  /** Optional avatar URL */
  avatarUrl?: string;
};

export type TestimonialsRotatingQuoteSlots = {
  eyebrow?: string;
  testimonials: Testimonial[];
  /** Auto-rotate interval in ms. 0 disables auto-rotation. */
  intervalMs?: number;
};

export default function TestimonialsRotatingQuote(props: TestimonialsRotatingQuoteSlots) {
  const { eyebrow, testimonials, intervalMs = 6000 } = props;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!intervalMs || testimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % testimonials.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, testimonials.length]);

  if (testimonials.length === 0) return null;
  const current = testimonials[active];

  return (
    <Section className="relative overflow-hidden">
      <Container width="narrow">
        <div className="text-center">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

          {/* Quote */}
          <blockquote className="mt-6 sm:mt-8" aria-live="polite">
            <p
              key={active}
              className="font-lib-display text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.25] tracking-[-0.015em] text-lib-foreground animate-[libFadeUp_500ms_cubic-bezier(.165,.84,.44,1)_both]"
              style={{ fontWeight: 500 }}
            >
              &ldquo;{current.quote}&rdquo;
            </p>
          </blockquote>

          {/* Author */}
          <div className="mt-7 sm:mt-9 flex items-center justify-center gap-3">
            {current.avatarUrl && (
              <img
                src={current.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-lib-border"
              />
            )}
            <div className="text-left">
              <div className="text-sm sm:text-base font-semibold text-lib-foreground">{current.author}</div>
              {current.role && <div className="text-xs sm:text-sm text-lib-muted">{current.role}</div>}
            </div>
          </div>

          {/* Indicators */}
          {testimonials.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5" role="tablist">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-1 rounded-full transition-all duration-300 ease-out ${
                    i === active ? "w-8 bg-lib-accent" : "w-2 bg-lib-border hover:bg-lib-muted"
                  }`}
                  aria-selected={i === active}
                  aria-label={`Testemunho ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>

      <style>{`
        @keyframes libFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Section>
  );
}
