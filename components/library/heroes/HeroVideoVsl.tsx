"use client";

import { useState } from "react";
import { Section, Container, ButtonPrimary, ButtonSecondary, Eyebrow } from "../_lib/Container";

export type HeroVideoVslSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  /** YouTube/Vimeo/Wistia embed URL. Required — this block is for VSL pages. */
  vslEmbedUrl: string;
  /** Optional poster image shown before play. */
  vslPosterUrl?: string;
  primaryCtaLabel: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  refundLine?: string;
  /** Optional 3-stat trust strip below CTAs (value + label). */
  stats?: { value: string; label: string }[];
};

export default function HeroVideoVsl(props: HeroVideoVslSlots) {
  const {
    eyebrow,
    headline,
    subheadline,
    vslEmbedUrl,
    vslPosterUrl,
    primaryCtaLabel,
    primaryCtaHref = "#",
    secondaryCtaLabel,
    secondaryCtaHref = "#",
    refundLine,
    stats,
  } = props;

  const [playing, setPlaying] = useState(false);

  return (
    <Section className="relative">
      <Container width="wide">
        {/* Headline + sub-line — tight, one-line subhead so the video stays prominent */}
        <div className="text-center max-w-[940px] mx-auto">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

          <h1
            className="font-lib-display mt-5 max-w-[20ch] mx-auto text-[clamp(2.25rem,7vw,4.75rem)] leading-[1.04] tracking-[-0.02em] text-lib-foreground text-balance"
            style={{ fontWeight: 600 }}
          >
            {headline}
          </h1>

          {subheadline && (
            <p className="mt-6 text-base sm:text-lg md:text-xl text-lib-muted max-w-[60ch] mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}
        </div>

        {/* Video — the protagonist */}
        <div
          className="mt-10 md:mt-14 max-w-[1100px] mx-auto bg-lib-surface border border-lib-border rounded-[var(--lib-radius-section)] overflow-hidden relative"
          style={{ aspectRatio: "16 / 9" }}
        >
          {playing ? (
            <iframe
              src={`${vslEmbedUrl}${vslEmbedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title="Video"
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 w-full h-full group"
              aria-label="Play video"
            >
              {vslPosterUrl && (
                <img
                  src={vslPosterUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              {/* Subtle texture if no poster */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, var(--lib-surface) 0%, var(--lib-bg) 100%)",
                  zIndex: -1,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />

              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative inline-flex items-center justify-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-lib-accent text-lib-accent-foreground transition-transform duration-300 group-hover:scale-105">
                  <span
                    className="absolute inset-0 rounded-full bg-lib-accent/40 animate-ping"
                    style={{ animationDuration: "2.4s" }}
                  />
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13l11-6.5L8 5.5z" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>

        {/* CTAs */}
        <div className="mt-10 md:mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <ButtonPrimary href={primaryCtaHref}>{primaryCtaLabel} →</ButtonPrimary>
            {secondaryCtaLabel && (
              <ButtonSecondary href={secondaryCtaHref}>{secondaryCtaLabel}</ButtonSecondary>
            )}
          </div>
          {refundLine && (
            <p className="mt-5 text-sm text-lib-muted">{refundLine}</p>
          )}
        </div>

        {/* Stats strip */}
        {stats && stats.length > 0 && (
          <div className="mt-16 md:mt-20 max-w-[1100px] mx-auto">
            <div className="grid sm:grid-cols-3 gap-6 md:gap-10">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label} className="border-t border-lib-border pt-5 text-center sm:text-left">
                  <div
                    className="font-lib-display text-3xl md:text-4xl text-lib-foreground"
                    style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-sm text-lib-muted mt-1.5 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
