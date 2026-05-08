"use client";

import { Section, Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "../_lib/Container";

export type HeroSplitImageTextSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  imageUrl: string;
  imageAlt?: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export default function HeroSplitImageText(props: HeroSplitImageTextSlots) {
  const {
    eyebrow,
    headline,
    subheadline,
    imageUrl,
    imageAlt = "",
    primaryCtaLabel,
    primaryCtaHref = "#",
    secondaryCtaLabel,
    secondaryCtaHref = "#",
  } = props;

  return (
    <Section>
      <Container width="wide">
        <div className="grid gap-10 md:gap-12 lg:gap-16 lg:grid-cols-[1fr_1.05fr] items-center">
          {/* Image — first on mobile so users see the visual immediately */}
          <div className="order-1 lg:order-2 relative aspect-[5/4] md:aspect-[16/11] lg:aspect-[5/6] overflow-hidden rounded-[var(--lib-radius-section)] bg-lib-surface">
            <img
              src={imageUrl}
              alt={imageAlt}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Copy */}
          <div className="order-2 lg:order-1">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1
              className="font-lib-display mt-4 text-[clamp(2rem,5.5vw,4rem)] leading-[1.06] tracking-[-0.02em] text-lib-foreground"
              style={{ fontWeight: 600 }}
            >
              {headline}
            </h1>
            {subheadline && (
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-lib-muted max-w-[52ch] leading-relaxed">
                {subheadline}
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5">
              <ButtonPrimary href={primaryCtaHref} className="w-full sm:w-auto">
                {primaryCtaLabel}
              </ButtonPrimary>
              {secondaryCtaLabel && (
                <ButtonSecondary href={secondaryCtaHref}>{secondaryCtaLabel} →</ButtonSecondary>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
