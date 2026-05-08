"use client";

import { Section, Container, Eyebrow, ButtonSecondary } from "../_lib/Container";

export type Article = {
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  /** ISO date or human-readable string */
  date?: string;
  href?: string;
  /** Reading time, e.g. "5 min" */
  readTime?: string;
};

export type ArticlesGrid3ColSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  articles: Article[];
  viewAllLabel?: string;
  viewAllHref?: string;
};

export default function ArticlesGrid3Col(props: ArticlesGrid3ColSlots) {
  const { eyebrow, headline, subheadline, articles, viewAllLabel, viewAllHref } = props;

  return (
    <Section>
      <Container>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 sm:mb-12 md:mb-14">
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
          {viewAllLabel && (
            <ButtonSecondary href={viewAllHref}>{viewAllLabel} →</ButtonSecondary>
          )}
        </div>

        <ul className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {articles.map((a, i) => (
            <li key={a.title + i}>
              <a
                href={a.href || "#"}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lib-accent rounded-[var(--lib-radius-card)]"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-[var(--lib-radius-card)] bg-lib-surface relative">
                  {a.imageUrl ? (
                    <img
                      src={a.imageUrl}
                      alt={a.imageAlt || ""}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--lib-surface), var(--lib-bg))",
                      }}
                    />
                  )}
                </div>

                <div className="mt-4 sm:mt-5 flex items-center gap-2.5 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-lib-muted font-semibold">
                  {a.category && <span>{a.category}</span>}
                  {a.category && (a.date || a.readTime) && (
                    <span aria-hidden className="opacity-50">·</span>
                  )}
                  {a.date && <span>{a.date}</span>}
                  {a.readTime && (
                    <>
                      {(a.category || a.date) && <span aria-hidden className="opacity-50">·</span>}
                      <span>{a.readTime}</span>
                    </>
                  )}
                </div>

                <h3
                  className="font-lib-display mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl text-lib-foreground tracking-[-0.01em] group-hover:text-lib-accent transition-colors duration-300"
                  style={{ fontWeight: 500 }}
                >
                  {a.title}
                </h3>

                {a.excerpt && (
                  <p className="mt-2 text-sm sm:text-base text-lib-muted leading-relaxed line-clamp-3">
                    {a.excerpt}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
