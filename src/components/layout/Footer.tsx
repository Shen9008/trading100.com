import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { SiteLogo } from "./SiteLogo";

const FOOTER_COLUMNS = [
  {
    title: "Markets",
    links: [
      { label: "Currencies", href: "/markets?tab=currencies" },
      { label: "Commodities", href: "/markets?tab=commodities" },
      { label: "Crypto", href: "/markets?tab=crypto" },
      { label: "Indices", href: "/markets?tab=indices" },
      { label: "Stocks", href: "/markets?tab=stocks" },
    ],
  },
  {
    title: "News",
    links: [
      { label: "Latest News", href: "/news" },
      { label: "Forecasts", href: "/forecasts" },
      { label: "Forex", href: "/news?category=forex" },
      { label: "Crypto", href: "/news?category=crypto" },
    ],
  },
  {
    title: "Education",
    links: [
      { label: "All Guides", href: "/education" },
      { label: "How to Trade Forex", href: "/education/how-to-trade-forex" },
      { label: "How to Read RSI", href: "/education/how-to-read-rsi" },
      { label: "Risk Management", href: "/education/risk-management-for-traders" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Economic Calendar", href: "/tools/economic-calendar" },
      { label: "Currency Converter", href: "/tools/currency-converter" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.05] pb-[env(safe-area-inset-bottom)]">
      <div className="border-b border-white/[0.05] bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <SiteLogo variant="footer" />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              A premium market intelligence platform for price discovery, news,
              forecasts, and trader education.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              iOS — Soon
            </span>
            <span className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Android — Soon
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4">{col.title}</h3>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.05] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
            Data may be delayed · Educational use only
          </p>
        </div>
      </div>
      <DisclaimerBanner compact />
    </footer>
  );
}
