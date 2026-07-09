import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { DisclaimerBanner } from "./DisclaimerBanner";

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
    <footer className="mt-auto border-t border-white/[0.06] bg-card/40 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/[0.06] pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="font-display text-xl font-bold">
              <span className="text-brand">TRADING</span>
              <span className="text-foreground">100</span>
            </Link>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Live markets. Smart analysis. Better decisions — built for traders who demand clarity.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
              App Store — Soon
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-muted-foreground">
              Google Play — Soon
            </span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
      <DisclaimerBanner compact />
    </footer>
  );
}
