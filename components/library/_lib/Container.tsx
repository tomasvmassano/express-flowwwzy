/**
 * Shared layout primitives for library blocks.
 *
 * Container:  max-width 1200, responsive horizontal padding
 * Section:    vertical padding via --lib-section-y
 *
 * Blocks compose these so vertical rhythm and gutters are consistent.
 */

import { ReactNode, ElementType } from "react";

export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  const max =
    width === "narrow" ? "max-w-[820px]" : width === "wide" ? "max-w-[1320px]" : "max-w-[1200px]";
  return (
    <div className={`${max} mx-auto px-5 sm:px-6 md:px-8 lg:px-10 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  className = "",
  as: As = "section" as ElementType,
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}) {
  return (
    <As
      id={id}
      className={`bg-lib-bg text-lib-foreground ${className}`}
      style={{ paddingTop: "var(--lib-section-y)", paddingBottom: "var(--lib-section-y)" }}
    >
      {children}
    </As>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.16em] text-lib-muted font-lib-body font-semibold">
      {children}
    </span>
  );
}

export function ButtonPrimary({
  children,
  href,
  onClick,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const cls = `inline-flex items-center justify-center gap-2 bg-lib-accent text-lib-accent-foreground font-semibold px-5 py-3 sm:px-6 sm:py-3.5 rounded-[8px] text-sm sm:text-base transition-transform duration-200 ease-out hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lib-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lib-bg ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type={type} onClick={onClick} className={cls}>{children}</button>;
}

export function ButtonSecondary({
  children,
  href,
  onClick,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `inline-flex items-center gap-1.5 text-lib-foreground font-medium text-sm sm:text-base hover:text-lib-accent transition-colors duration-200 ${className}`;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}
