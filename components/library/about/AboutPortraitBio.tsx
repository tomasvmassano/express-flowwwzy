"use client";

import { Section, Container, ButtonSecondary, Eyebrow } from "../_lib/Container";

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutPortraitBioSlots = {
  eyebrow?: string;
  name: string;
  role: string;
  bio: string;
  portraitUrl: string;
  portraitAlt?: string;
  stats?: AboutStat[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function AboutPortraitBio(props: AboutPortraitBioSlots) {
  const {
    eyebrow,
    name,
    role,
    bio,
    portraitUrl,
    portraitAlt,
    stats,
    ctaLabel,
    ctaHref = "#",
  } = props;

  return (
    <Section>
      <Container>
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:gap-16 lg:grid-cols-[minmax(0,360px)_1fr] items-start">
          {/* Portrait */}
          <div className="relative aspect-[4/5] max-w-[420px] lg:max-w-none w-full overflow-hidden rounded-[var(--lib-radius-section)] bg-lib-surface">
            <img
              src={portraitUrl}
              alt={portraitAlt || name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* Bio */}
          <div>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2
              className="font-lib-display mt-4 text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.05] tracking-[-0.02em] text-lib-foreground"
              style={{ fontWeight: 600 }}
            >
              {name}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-lib-muted">{role}</p>

            <p className="mt-6 sm:mt-7 text-base sm:text-lg text-lib-foreground/90 leading-relaxed max-w-[58ch]">
              {bio}
            </p>

            {ctaLabel && (
              <div className="mt-8">
                <ButtonSecondary href={ctaHref}>{ctaLabel} →</ButtonSecondary>
              </div>
            )}

            {stats && stats.length > 0 && (
              <dl className="mt-10 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6 border-t border-lib-border pt-6 sm:pt-8 max-w-[480px]">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-lib-display text-2xl sm:text-3xl md:text-4xl text-lib-foreground tracking-[-0.02em]" style={{ fontWeight: 600 }}>
                      {s.value}
                    </dd>
                    <div className="mt-1 text-xs sm:text-sm text-lib-muted">{s.label}</div>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
