"use client";

import { Section, Container, Eyebrow, ButtonSecondary } from "../_lib/Container";

export type GalleryItem = {
  imageUrl: string;
  imageAlt?: string;
  title?: string;
  category?: string;
  href?: string;
  /** "tall" | "wide" | "square" — controls the bento cell size on desktop */
  shape?: "tall" | "wide" | "square";
};

export type GalleryImageGridSlots = {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  items: GalleryItem[];
  viewAllLabel?: string;
  viewAllHref?: string;
};

export default function GalleryImageGrid(props: GalleryImageGridSlots) {
  const { eyebrow, headline, subheadline, items, viewAllLabel, viewAllHref } = props;

  return (
    <Section>
      <Container width="wide">
        {(eyebrow || headline || subheadline) && (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 sm:mb-12 md:mb-14">
            <div className="max-w-[44ch]">
              {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
              {headline && (
                <h2
                  className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground"
                  style={{ fontWeight: 600 }}
                >
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className="mt-3 text-base sm:text-lg text-lib-muted leading-relaxed">{subheadline}</p>
              )}
            </div>
            {viewAllLabel && <ButtonSecondary href={viewAllHref}>{viewAllLabel} →</ButtonSecondary>}
          </div>
        )}

        {/* Mobile: simple stack. Tablet: 2-col. Desktop: 3-col bento with shape hints. */}
        <ul
          className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[200px]"
          role="list"
        >
          {items.map((item, i) => {
            const shapeClass =
              item.shape === "tall"
                ? "lg:row-span-2"
                : item.shape === "wide"
                ? "lg:col-span-2"
                : "";
            const aspect =
              item.shape === "tall" ? "aspect-[3/4]" : item.shape === "wide" ? "aspect-[16/9]" : "aspect-square";
            return (
              <li key={item.imageUrl + i} className={`relative ${shapeClass}`}>
                <a
                  href={item.href || "#"}
                  className="group relative block overflow-hidden rounded-[var(--lib-radius-card)] bg-lib-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lib-accent h-full"
                >
                  <div className={`relative w-full h-full ${aspect} lg:aspect-auto`}>
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title || ""}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    {(item.title || item.category) && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                          {item.category && (
                            <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-white/80">
                              {item.category}
                            </span>
                          )}
                          {item.title && (
                            <div className="font-lib-display text-base sm:text-lg md:text-xl text-white tracking-tight mt-0.5" style={{ fontWeight: 500 }}>
                              {item.title}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
