declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "Purchase"
  | "FormStarted"
  | "FormCompleted";

export function track(event: EventName, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (window.fbq) {
      const standard = ["PageView", "ViewContent", "Lead", "InitiateCheckout", "Purchase"];
      if (standard.includes(event)) window.fbq("track", event, payload);
      else window.fbq("trackCustom", event, payload);
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
  } catch {}
}
