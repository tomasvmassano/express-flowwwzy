"use client";

import { Section, Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "../_lib/Container";

export type HeroCenteredDisplaySlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export default function HeroCenteredDisplay(props: HeroCenteredDisplaySlots) {
  const {
    eyebrow,
    headline,
    subheadline,
    primaryCtaLabel,
    primaryCtaHref = "#",
    secondaryCtaLabel,
    secondaryCtaHref = "#",
  } = props;

  return (
    <Section className="text-center">
      <Container width="narrow">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

        <h1
          className="font-lib-display mt-5 text-[clamp(2.25rem,7vw,4.75rem)] leading-[1.04] tracking-[-0.02em] text-lib-foreground"
          style={{ fontWeight: 600 }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-lib-muted max-w-[58ch] mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <ButtonPrimary href={primaryCtaHref} className="w-full sm:w-auto">
            {primaryCtaLabel}
          </ButtonPrimary>
          {secondaryCtaLabel && (
            <ButtonSecondary href={secondaryCtaHref}>{secondaryCtaLabel} →</ButtonSecondary>
          )}
        </div>
      </Container>
    </Section>
  );
}
