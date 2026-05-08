"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type ServiceItem = {
  title: string;
  description: string;
};

export type ServicesAccordionSlots = {
  eyebrow?: string;
  headline: string;
  items: ServiceItem[];
};

export default function ServicesAccordion(props: ServicesAccordionSlots) {
  const { eyebrow, headline, items } = props;

  return (
    <Section>
      <Container width="narrow">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2
          className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground"
          style={{ fontWeight: 600 }}
        >
          {headline}
        </h2>

        <ul className="mt-10 sm:mt-12 md:mt-14 border-t border-lib-border" role="list">
          {items.map((item, i) => (
            <li key={item.title + i} className="border-b border-lib-border">
              <details className="group">
                <summary className="cursor-pointer list-none flex items-baseline gap-4 sm:gap-6 py-5 sm:py-6 md:py-7 outline-none focus-visible:bg-lib-surface/50 transition-colors duration-200">
                  <span className="text-xs sm:text-sm tabular-nums text-lib-muted font-semibold w-8 sm:w-10 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-lib-display text-lg sm:text-xl md:text-2xl text-lib-foreground tracking-[-0.01em] flex-1"
                    style={{ fontWeight: 500 }}
                  >
                    {item.title}
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
                <div className="pb-6 sm:pb-7 md:pb-8 pl-12 sm:pl-16 pr-4 sm:pr-12 text-sm sm:text-base text-lib-muted leading-relaxed">
                  {item.description}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
