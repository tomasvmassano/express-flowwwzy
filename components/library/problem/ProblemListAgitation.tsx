"use client";

import { Section, Container, Eyebrow } from "../_lib/Container";

export type ProblemListAgitationSlots = {
  eyebrow?: string;
  /** 3-5 pain lines stacked. The hard truth. */
  painLines: string[];
  /**
   * Optional resolution line — the contrast that sets up the rest of the
   * page. Renders larger and italicized.
   */
  resolutionLine?: string;
  /** Optional words from resolutionLine to render in the accent color */
  resolutionAccent?: string;
};

export default function ProblemListAgitation(props: ProblemListAgitationSlots) {
  const { eyebrow, painLines, resolutionLine, resolutionAccent } = props;

  let resBefore = resolutionLine || "";
  let resAccent = "";
  let resAfter = "";
  if (resolutionLine && resolutionAccent) {
    const idx = resolutionLine.indexOf(resolutionAccent);
    if (idx >= 0) {
      resBefore = resolutionLine.slice(0, idx);
      resAccent = resolutionAccent;
      resAfter = resolutionLine.slice(idx + resolutionAccent.length);
    }
  }

  return (
    <Section>
      <Container width="narrow">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

        <ul className={`${eyebrow ? "mt-8 sm:mt-10" : ""} space-y-7 sm:space-y-10 md:space-y-12`} role="list">
          {painLines.map((line, i) => (
            <li
              key={i}
              className="font-lib-display text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.15] tracking-[-0.02em] text-lib-foreground"
              style={{ fontWeight: 500, maxWidth: "20ch" }}
            >
              {line}
            </li>
          ))}
        </ul>

        {resolutionLine && (
          <p
            className="mt-12 sm:mt-16 md:mt-20 font-lib-display italic text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.15] tracking-[-0.015em] text-lib-muted"
            style={{ fontWeight: 400 }}
          >
            {resAccent ? (
              <>
                {resBefore}
                <span className="text-lib-accent not-italic" style={{ fontStyle: "italic" }}>
                  {resAccent}
                </span>
                {resAfter}
              </>
            ) : (
              resolutionLine
            )}
          </p>
        )}
      </Container>
    </Section>
  );
}
