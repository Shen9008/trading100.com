import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Calendar, TrendingUp } from "lucide-react";

const QUICK_LINKS = [
  { label: "Markets", href: "/markets", icon: TrendingUp },
  { label: "Forecasts", href: "/forecasts", icon: BarChart3 },
  { label: "Calendar", href: "/tools/economic-calendar", icon: Calendar },
  { label: "Learn", href: "/education", icon: BookOpen },
];

const STATS = [
  { label: "Asset Classes", value: "6" },
  { label: "Live Instruments", value: "40+" },
  { label: "Markets Open", value: "24/7" },
];

export function HeroStrip() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-accent/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14">
        <div className="animate-fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">
            Real-time intelligence
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Navigate global markets with{" "}
            <span className="gradient-text">precision</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Live forex, crypto, commodities, and indices — paired with original
            analysis, forecasts, and trader education.
          </p>
        </div>

        <div className="mt-8 flex animate-fade-up-delay-1 flex-wrap gap-3">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-brand/40 hover:bg-brand/10 hover:text-brand"
            >
              <Icon className="h-4 w-4 text-brand/80 transition-colors group-hover:text-brand" />
              {label}
              <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-10 grid animate-fade-up-delay-2 grid-cols-3 gap-4 border-t border-white/[0.06] pt-8 sm:max-w-lg">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-2xl font-bold text-brand sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
