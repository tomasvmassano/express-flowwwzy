"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type ProcessStep = {
  title: string;
  description: string;
  /** Optional metadata shown to the right of the title (e.g. "Day 1-2") */
  meta?: string;
};

export type ProcessVerticalTimelineSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  steps: ProcessStep[];
};

export default function ProcessVerticalTimeline(props: ProcessVerticalTimelineSlots) {
  const { eyebrow, headline, subheadline, steps } = props;

  return (
    <Section>
      <Container width="narrow">
        <div className="text-center max-w-[44ch] mx-auto mb-12 sm:mb-14 md:mb-16">
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

        <ol className="relative" role="list">
          {/* Vertical line — sits 14px from the left on mobile, 16px on desktop */}
          <span
            aria-hidden
            className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-[1px] bg-lib-border"
          />

          {steps.map((s, i) => (
            <li key={s.title + i} className="relative pl-10 sm:pl-14 pb-10 sm:pb-12 last:pb-0">
              {/* Dot */}
              <span
                aria-hidden
                className="absolute left-0 top-1 w-[31px] h-[31px] sm:w-[39px] sm:h-[39px] rounded-full border border-lib-border bg-lib-bg flex items-center justify-center text-[11px] sm:text-xs font-semibold tabular-nums text-lib-muted"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 mb-2 sm:mb-3">
                <h3
                  className="font-lib-display text-lg sm:text-xl md:text-2xl text-lib-foreground tracking-[-0.01em]"
                  style={{ fontWeight: 500 }}
                >
                  {s.title}
                </h3>
                {s.meta && (
                  <span className="text-xs uppercase tracking-[0.14em] text-lib-muted font-semibold flex-shrink-0">
                    {s.meta}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-lib-muted leading-relaxed max-w-[58ch]">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
