"use client";

import { Section, Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "../_lib/Container";

export type CtaBannerClosingSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /**
   * "centered" (default) renders flat; "island" wraps in a surface card.
   * Widened to `string` so AI-generated content compiles; runtime
   * normalises anything outside the canonical set back to "centered".
   */
  variant?: string;
};

export default function CtaBannerClosing(props: CtaBannerClosingSlots) {
  const {
    eyebrow,
    headline,
    subheadline,
    primaryCtaLabel,
    primaryCtaHref = "#",
    secondaryCtaLabel,
    secondaryCtaHref = "#",
    variant: rawVariant,
  } = props;
  const variant = rawVariant === "island" ? "island" : "centered";

  if (variant === "island") {
    return (
      <Section>
        <Container>
          <div className="bg-lib-surface border border-lib-border rounded-[var(--lib-radius-section)] p-8 sm:p-10 md:p-14 lg:p-20 text-center">
            <CtaContent
              eyebrow={eyebrow}
              headline={headline}
              subheadline={subheadline}
              primaryCtaLabel={primaryCtaLabel}
              primaryCtaHref={primaryCtaHref}
              secondaryCtaLabel={secondaryCtaLabel}
              secondaryCtaHref={secondaryCtaHref}
            />
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="text-center">
      <Container width="narrow">
        <CtaContent
          eyebrow={eyebrow}
          headline={headline}
          subheadline={subheadline}
          primaryCtaLabel={primaryCtaLabel}
          primaryCtaHref={primaryCtaHref}
          secondaryCtaLabel={secondaryCtaLabel}
          secondaryCtaHref={secondaryCtaHref}
        />
      </Container>
    </Section>
  );
}

function CtaContent(props: Required<Pick<CtaBannerClosingSlots, "headline" | "primaryCtaLabel" | "primaryCtaHref">> & Partial<Omit<CtaBannerClosingSlots, "variant">>) {
  const { eyebrow, headline, subheadline, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref } = props;
  return (
    <>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className="font-lib-display mt-4 text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.025em] text-lib-foreground"
        style={{ fontWeight: 600 }}
      >
        {headline}
      </h2>
      {subheadline && (
        <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-lib-muted max-w-[58ch] mx-auto leading-relaxed">
          {subheadline}
        </p>
      )}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
        <ButtonPrimary href={primaryCtaHref} className="w-full sm:w-auto">
          {primaryCtaLabel} →
        </ButtonPrimary>
        {secondaryCtaLabel && (
          <ButtonSecondary href={secondaryCtaHref}>{secondaryCtaLabel}</ButtonSecondary>
        )}
      </div>
    </>
  );
}
