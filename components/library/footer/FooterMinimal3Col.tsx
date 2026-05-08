"use client";

export type FooterLink = { label: string; href: string };

export type FooterMinimal3ColSlots = {
  brandName: string;
  tagline?: string;
  columns: { title: string; links: FooterLink[] }[];
  socialLinks?: { label: "Instagram" | "LinkedIn" | "Twitter" | "Email"; href: string }[];
  copyright?: string;
  legalLinks?: FooterLink[];
};

export default function FooterMinimal3Col(props: FooterMinimal3ColSlots) {
  const {
    brandName,
    tagline,
    columns,
    socialLinks,
    copyright,
    legalLinks,
  } = props;

  return (
    <footer className="bg-lib-bg text-lib-foreground border-t border-lib-border">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 lg:px-10 py-12 sm:py-14 md:py-16">
        <div className="grid gap-10 sm:gap-12 md:gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-lib-display text-xl sm:text-2xl tracking-[-0.02em] text-lib-foreground" style={{ fontWeight: 600 }}>
              {brandName}
            </div>
            {tagline && (
              <p className="mt-3 text-sm sm:text-base text-lib-muted max-w-[36ch] leading-relaxed">{tagline}</p>
            )}
            {socialLinks && socialLinks.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-lib-border flex items-center justify-center text-lib-muted hover:border-lib-accent hover:text-lib-accent transition-colors duration-200"
                  >
                    <SocialIcon name={s.label} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns — collapse to 1col on mobile, 2 on tablet */}
          <div className="grid grid-cols-2 md:col-span-2 gap-8 sm:gap-10">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs uppercase tracking-[0.14em] font-semibold text-lib-muted mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2.5 sm:space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm sm:text-base text-lib-foreground/80 hover:text-lib-accent transition-colors duration-200"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 sm:mt-14 pt-6 border-t border-lib-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-lib-muted">
          <span>{copyright || `© ${new Date().getFullYear()} ${brandName}.`}</span>
          {legalLinks && legalLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="hover:text-lib-foreground transition-colors duration-200"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: "Instagram" | "LinkedIn" | "Twitter" | "Email" }) {
  switch (name) {
    case "Instagram":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
        </svg>
      );
    case "Twitter":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "Email":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
  }
}
