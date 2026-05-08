import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        "dark-grey": "#0F1010",
        spotlight: "#131313",
        divider: "#262626",
        "gray-500": "#757575",
        "gray-300": "#B3B3B3",
        white: "#ECECEC",
        "pure-white": "#FFFFFF",
        cream: "#FAEBE3",
        primary: "#307097",
        "off-white": "#FCFCFC",
        // Library tokens — see comment in backgroundImage section.
        "lib-bg": "var(--lib-bg)",
        "lib-surface": "var(--lib-surface)",
        "lib-foreground": "var(--lib-foreground)",
        "lib-muted": "var(--lib-muted)",
        "lib-accent": "var(--lib-accent)",
        "lib-accent-foreground": "var(--lib-accent-foreground)",
        "lib-border": "var(--lib-border)",
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "sans-serif"],
        oktaneue: ["Oktaneue", "Satoshi", "sans-serif"],
        serif: ["'STIX Two Text'", "Georgia", "serif"],
        // Library — generic by design. Themes override the CSS vars.
        "lib-display": "var(--lib-font-display)",
        "lib-body": "var(--lib-font-body)",
      },
      fontSize: {
        h1: ["clamp(2.75rem, 7vw, 6.6rem)", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        h2: ["clamp(2rem, 4.4vw, 3.875rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h3: ["1.5rem", { lineHeight: "1.25" }],
        "body-lg": ["1.125rem", { lineHeight: "1.5" }],
        body: ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },
      borderRadius: { tiny: "0.25rem", DEFAULT: "0.5rem", card: "12px", section: "20px" },
      transitionTimingFunction: {
        snappy: "cubic-bezier(.165, .84, .44, 1)",
        anticipate: "cubic-bezier(.865, .007, 1, 1)",
      },
      maxWidth: { container: "1250px" },
      backgroundImage: {
        spotlight: "radial-gradient(ellipse 80% 60% at 50% 30%, #131313 0%, transparent 70%)",
        "spotlight-warm":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(250,235,227,0.08) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 50%, #131313 0%, transparent 70%)",
      },
      // ─── Library tokens (Studio component library) ─────────────────────
      // Blocks reference these via Tailwind aliases (e.g. bg-lib-surface,
      // text-lib-foreground). Values resolve at runtime from CSS vars set
      // by <LibraryRoot>. Swapping palette = rewriting the vars on the
      // wrapper. Blocks never know which palette is active.
      ringColor: {
        "lib-accent": "var(--lib-accent)",
      },
      keyframes: {
        "marquee": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 600ms cubic-bezier(.165, .84, .44, 1) both",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
