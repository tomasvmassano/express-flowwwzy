"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type BenefitItem = {
  /**
   * Inline icon name. Validated at render — invalid values render no icon.
   * Type is `string` (not the literal union) so AI-generated content compiles
   * without per-call casts; runtime validation enforces the canonical set.
   */
  icon?: string;
  title: string;
  body: string;
};

export type BenefitsGridIconsSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  /** 2-6 benefit cards. 2 → single row; 4 → 2x2 desktop; 6 → 3x2. */
  benefits: BenefitItem[];
};

export default function BenefitsGridIcons(props: BenefitsGridIconsSlots) {
  const { eyebrow, headline, subheadline, benefits } = props;

  return (
    <Section>
      <Container>
        <div className="max-w-none">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2
            className="font-lib-display mt-4 max-w-[36ch] text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.08] tracking-[-0.02em] text-lib-foreground text-balance"
            style={{ fontWeight: 600 }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-4 max-w-[60ch] text-base sm:text-lg text-lib-muted leading-relaxed">
              {subheadline}
            </p>
          )}
        </div>

        <ul
          className="mt-12 sm:mt-14 md:mt-20 grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-2"
          role="list"
        >
          {benefits.map((b, i) => (
            <li
              key={b.title + i}
              className="card-row bg-lib-surface border border-lib-border rounded-[var(--lib-radius-card)] p-7 md:p-9 flex gap-5 md:gap-7"
            >
              {isBenefitIconName(b.icon) && (
                <span className="flex-shrink-0 w-12 h-12 rounded-card border border-lib-border flex items-center justify-center text-lib-accent">
                  <BenefitIcon name={b.icon} />
                </span>
              )}
              <div className="min-w-0">
                <h3
                  className="font-lib-display text-h3 mb-3 text-lib-foreground"
                  style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
                >
                  {b.title}
                </h3>
                <p className="text-base text-lib-muted leading-relaxed">{b.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

// ─── Icon set ─────────────────────────────────────────────────────────

export type BenefitIconName = "clock" | "tag" | "spark" | "shield" | "zap" | "check";

const BENEFIT_ICON_NAMES: readonly BenefitIconName[] = ["clock", "tag", "spark", "shield", "zap", "check"];

function isBenefitIconName(v: string | undefined): v is BenefitIconName {
  return !!v && (BENEFIT_ICON_NAMES as readonly string[]).includes(v);
}

function BenefitIcon({ name }: { name: BenefitIconName }) {
  const stroke = "currentColor";
  const sw = 1.5;
  switch (name) {
    case "clock":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
          <path d="M12 7v5l3.5 2.2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "tag":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12V4h8l9 9-8 8-9-9z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <circle cx="7.5" cy="7.5" r="1.4" fill={stroke} />
        </svg>
      );
    case "spark":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l8 3v6c0 4.5-3.4 8.6-8 9.5C7.4 20.6 4 16.5 4 12V6l8-3z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "zap":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={sw} />
          <path d="M8 12.5l3 3 5-6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
