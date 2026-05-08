"use client";

import { Section, Container, ButtonPrimary, Eyebrow } from "../_lib/Container";

export type HeroBoldStatementSlots = {
  eyebrow?: string;
  /** The hero statement. Designed to be 4-10 words for max impact. */
  statement: string;
  /** Optional accent word — rendered larger/different to draw the eye. */
  accentWord?: string;
  byline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
};

export default function HeroBoldStatement(props: HeroBoldStatementSlots) {
  const { eyebrow, statement, accentWord, byline, primaryCtaLabel, primaryCtaHref = "#" } = props;

  // If accentWord is provided AND appears in statement, split for styled span.
  let before = statement;
  let after = "";
  let hasAccent = false;
  if (accentWord) {
    const idx = statement.indexOf(accentWord);
    if (idx >= 0) {
      before = statement.slice(0, idx);
      after = statement.slice(idx + accentWord.length);
      hasAccent = true;
    }
  }

  return (
    <Section>
      <Container width="wide">
        <div className="flex flex-col items-start sm:items-stretch">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

          <h1
            className="font-lib-display mt-4 sm:mt-6 text-[clamp(2.5rem,11vw,9rem)] leading-[0.95] tracking-[-0.035em] text-lib-foreground"
            style={{ fontWeight: 700 }}
          >
            {hasAccent ? (
              <>
                {before}
                <span className="text-lib-accent italic font-normal" style={{ fontStyle: "italic" }}>
                  {accentWord}
                </span>
                {after}
              </>
            ) : (
              statement
            )}
          </h1>

          {(byline || primaryCtaLabel) && (
            <div className="mt-10 sm:mt-14 flex flex-col-reverse sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-10 border-t border-lib-border pt-6">
              {byline && (
                <p className="text-base sm:text-lg text-lib-muted max-w-[42ch] leading-relaxed">{byline}</p>
              )}
              {primaryCtaLabel && (
                <ButtonPrimary href={primaryCtaHref} className="self-start sm:self-end">
                  {primaryCtaLabel} →
                </ButtonPrimary>
              )}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
