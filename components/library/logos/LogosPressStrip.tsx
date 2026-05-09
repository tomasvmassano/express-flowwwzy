"use client";

import { Container, Eyebrow } from "../_lib/Container";

export type LogoEntry = {
  name: string;
  /** Optional logo image URL. If absent, renders the name as text. */
  imageUrl?: string;
  href?: string;
};

export type LogosPressStripSlots = {
  eyebrow?: string;
  headline?: string;
  logos: LogoEntry[];
  /**
   * "grid" (default) = static grid; "marquee" = horizontal infinite scroll.
   * Widened to `string`; runtime normalises anything outside the set back to "grid".
   */
  variant?: string;
};

export default function LogosPressStrip(props: LogosPressStripSlots) {
  const { eyebrow, headline, logos, variant: rawVariant } = props;
  const variant = rawVariant === "marquee" ? "marquee" : "grid";

  return (
    <section
      className="bg-lib-bg text-lib-foreground"
      style={{ paddingTop: "calc(var(--lib-section-y) * 0.6)", paddingBottom: "calc(var(--lib-section-y) * 0.6)" }}
    >
      <Container>
        {(eyebrow || headline) && (
          <div className="text-center max-w-[40ch] mx-auto mb-8 sm:mb-10">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {headline && (
              <h2
                className="font-lib-display mt-3 text-base sm:text-lg md:text-xl text-lib-muted tracking-tight"
                style={{ fontWeight: 500 }}
              >
                {headline}
              </h2>
            )}
          </div>
        )}

        {variant === "grid" ? (
          <ul
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-8 sm:gap-y-10 items-center justify-items-center"
            role="list"
          >
            {logos.map((l, i) => (
              <LogoCell key={l.name + i} logo={l} />
            ))}
          </ul>
        ) : (
          <MarqueeRow logos={logos} />
        )}
      </Container>
    </section>
  );
}

function LogoCell({ logo }: { logo: LogoEntry }) {
  const inner = logo.imageUrl ? (
    <img
      src={logo.imageUrl}
      alt={logo.name}
      loading="lazy"
      className="max-h-10 sm:max-h-12 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
    />
  ) : (
    <span
      className="font-lib-display text-base sm:text-lg md:text-xl tracking-tight text-lib-muted hover:text-lib-foreground transition-colors duration-300 whitespace-nowrap"
      style={{ fontWeight: 500 }}
    >
      {logo.name}
      <sup className="text-[0.5em] ml-0.5 opacity-60">™</sup>
    </span>
  );
  return (
    <li>
      {logo.href ? (
        <a href={logo.href} target="_blank" rel="noopener" aria-label={logo.name}>
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

function MarqueeRow({ logos }: { logos: LogoEntry[] }) {
  if (logos.length === 0) return null;
  const doubled = [...logos, ...logos];
  return (
    <div className="group relative -mx-5 sm:-mx-6 md:-mx-10 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10"
        style={{ background: "linear-gradient(to right, var(--lib-bg), transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10"
        style={{ background: "linear-gradient(to left, var(--lib-bg), transparent)" }}
      />
      <div
        className="flex gap-10 sm:gap-14 md:gap-16 items-center will-change-transform animate-[libLogoMarquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animation-none"
        style={{ width: "max-content" }}
      >
        {doubled.map((l, i) => (
          <div key={i} className="flex-shrink-0">
            <LogoCell logo={l} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes libLogoMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
