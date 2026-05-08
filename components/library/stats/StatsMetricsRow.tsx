"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type Stat = {
  /** The big number — supports % and units inline (e.g. "94%", "5", "25+") */
  value: string;
  label: string;
  /** Optional 0-100 used to draw a tiny progress bar under the value */
  bar?: number;
};

export type StatsMetricsRowSlots = {
  eyebrow?: string;
  headline?: string;
  stats: Stat[];
};

export default function StatsMetricsRow(props: StatsMetricsRowSlots) {
  const { eyebrow, headline, stats } = props;
  // 2-col on mobile, N-col on desktop based on count (max 4)
  const cols = Math.min(stats.length, 4);
  const gridClass =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
      ? "grid-cols-2"
      : cols === 3
      ? "grid-cols-2 md:grid-cols-3"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <Section>
      <Container>
        {(eyebrow || headline) && (
          <div className="text-center max-w-[40ch] mx-auto mb-10 sm:mb-12 md:mb-14">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {headline && (
              <h2
                className="font-lib-display mt-4 text-[clamp(1.5rem,3.6vw,2.5rem)] leading-[1.1] tracking-[-0.02em] text-lib-foreground"
                style={{ fontWeight: 600 }}
              >
                {headline}
              </h2>
            )}
          </div>
        )}

        <dl className={`grid gap-x-6 gap-y-10 sm:gap-x-8 md:gap-x-12 ${gridClass}`}>
          {stats.map((s, i) => (
            <div key={s.label + i} className="border-t border-lib-border pt-5 sm:pt-6">
              <dd
                className="font-lib-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-lib-foreground"
                style={{ fontWeight: 600 }}
              >
                {s.value}
              </dd>
              {typeof s.bar === "number" && (
                <div className="mt-4 h-[3px] w-full bg-lib-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lib-accent transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, s.bar))}%` }}
                  />
                </div>
              )}
              <dt className="mt-3 text-sm sm:text-base text-lib-muted leading-snug">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
