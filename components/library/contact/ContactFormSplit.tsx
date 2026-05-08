"use client";

import { useState, FormEvent } from "react";
import { Section, Container, ButtonPrimary, Eyebrow } from "../_lib/Container";

export type ContactFormSplitSlots = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Address / contact lines shown above or below the form */
  contactLines?: { label: string; value: string; href?: string }[];
  submitLabel?: string;
  /** Where the form posts to. Defaults to a no-op handler that prints to console. */
  action?: string;
  successMessage?: string;
};

export default function ContactFormSplit(props: ContactFormSplitSlots) {
  const {
    eyebrow,
    headline,
    subheadline,
    imageUrl,
    imageAlt,
    contactLines,
    submitLabel = "Enviar",
    action,
    successMessage = "Recebido. Respondemos em 24h úteis.",
  } = props;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (action) return; //  let native action handle it
    e.preventDefault();
    setSubmitting(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (typeof window !== "undefined") console.log("[contact-form] (no action set)", data);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <Section>
      <Container>
        <div className="grid gap-8 sm:gap-10 lg:gap-14 lg:grid-cols-[1fr_1fr] items-start">
          {/* Left: image + contact lines */}
          <div className="order-2 lg:order-1">
            {imageUrl && (
              <div className="relative aspect-[4/3] md:aspect-[5/4] overflow-hidden rounded-[var(--lib-radius-section)] bg-lib-surface mb-6 sm:mb-8">
                <img
                  src={imageUrl}
                  alt={imageAlt || ""}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            )}

            {contactLines && contactLines.length > 0 && (
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                {contactLines.map((c) => (
                  <li key={c.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <span className="text-lib-muted text-xs uppercase tracking-[0.14em] font-semibold sm:w-24 flex-shrink-0">
                      {c.label}
                    </span>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="text-lib-foreground hover:text-lib-accent transition-colors duration-200"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <span className="text-lib-foreground">{c.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: form */}
          <div className="order-1 lg:order-2">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h2
              className="font-lib-display mt-4 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.06] tracking-[-0.02em] text-lib-foreground"
              style={{ fontWeight: 600 }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className="mt-4 text-base text-lib-muted leading-relaxed">{subheadline}</p>
            )}

            {submitted ? (
              <div className="mt-8 p-5 sm:p-6 rounded-[var(--lib-radius-card)] border border-lib-accent/40 bg-lib-surface">
                <p className="text-base text-lib-foreground">{successMessage}</p>
              </div>
            ) : (
              <form
                action={action}
                method="post"
                onSubmit={onSubmit}
                className="mt-7 sm:mt-8 grid gap-4 sm:gap-5"
              >
                <Field label="Nome" name="name" type="text" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Telefone" name="phone" type="tel" />
                <Field label="Mensagem" name="message" type="textarea" required />
                <div className="mt-2">
                  <ButtonPrimary type="submit" className="w-full sm:w-auto">
                    {submitting ? "A enviar..." : submitLabel} →
                  </ButtonPrimary>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: "text" | "email" | "tel" | "textarea";
  required?: boolean;
}) {
  const inputCls =
    "w-full bg-transparent border border-lib-border rounded-[10px] px-4 py-3 sm:py-3.5 text-base text-lib-foreground placeholder:text-lib-muted/60 focus:outline-none focus:border-lib-accent focus:ring-2 focus:ring-lib-accent/20 transition-colors duration-200";
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.14em] font-semibold text-lib-muted mb-2">
        {label}
        {required && <span className="text-lib-accent ml-1">*</span>}
      </span>
      {type === "textarea" ? (
        <textarea name={name} rows={4} required={required} className={`${inputCls} resize-y min-h-[120px]`} />
      ) : (
        <input name={name} type={type} required={required} className={inputCls} />
      )}
    </label>
  );
}
