import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { PageLinksBundle } from "@/lib/seo/site-links";

type RelatedLinksPanelProps = PageLinksBundle & {
  className?: string;
};

export function RelatedLinksPanel({
  internal,
  external,
  className = "",
}: RelatedLinksPanelProps) {
  if (internal.length === 0 && external.length === 0) return null;

  return (
    <section
      aria-labelledby="related-resources-heading"
      className={`border-t border-white/[0.06] bg-card/20 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        <h2
          id="related-resources-heading"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Related Resources
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Explore more on Trading 100 and authoritative sources for market
          context. Educational links only — not financial advice.
        </p>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {internal.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On Trading 100
              </h3>
              <ul className="mt-3 space-y-2">
                {internal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {external.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trusted External Sources
              </h3>
              <ul className="mt-3 space-y-2">
                {external.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
