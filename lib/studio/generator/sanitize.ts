/**
 * Per-component content sanitizers.
 *
 * contentSynth emits free-form JSON — the JSON-Schema we feed Claude is
 * an open object per section. That means string-typed slots that are
 * actually enums on the component side (e.g. BenefitItem.icon) can be
 * filled with values that fail TypeScript when we serialize the page.
 *
 * Any time a generated LP fails to typecheck on Vercel, the right
 * answer is either to widen the component prop or add a sanitizer
 * here. Sanitizers should NEVER reshape the slot — they only drop or
 * coerce values that would crash the build.
 */

const BENEFIT_ICONS = ["clock", "tag", "spark", "shield", "zap", "check"] as const;

type SanitizeFn = (content: Record<string, unknown>) => Record<string, unknown>;

const sanitizers: Record<string, SanitizeFn> = {
  "benefits-grid-icons": (content) => {
    const benefits = content.benefits;
    if (!Array.isArray(benefits)) return content;
    const cleaned = benefits.map((b) => {
      if (!b || typeof b !== "object") return b;
      const item = b as Record<string, unknown>;
      const icon = typeof item.icon === "string" ? item.icon.toLowerCase() : undefined;
      const validIcon =
        icon && (BENEFIT_ICONS as readonly string[]).includes(icon) ? icon : undefined;
      // Drop the icon field entirely when invalid — component renders fine without one.
      if (validIcon) {
        return { ...item, icon: validIcon };
      }
      const { icon: _drop, ...rest } = item;
      return rest;
    });
    return { ...content, benefits: cleaned };
  },
};

export function sanitizeSectionContent(
  manifestId: string,
  content: Record<string, unknown>
): Record<string, unknown> {
  const fn = sanitizers[manifestId];
  return fn ? fn(content) : content;
}
