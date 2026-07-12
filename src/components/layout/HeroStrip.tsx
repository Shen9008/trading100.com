import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  LineChart,
  TrendingUp,
} from "lucide-react";
import { STOCK_IMAGES } from "@/lib/constants/images";

const QUICK_LINKS = [
  { label: "Markets", href: "/markets", icon: TrendingUp },
  { label: "Forecasts", href: "/forecasts", icon: BarChart3 },
  { label: "Calendar", href: "/tools/economic-calendar", icon: Calendar },
  { label: "Academy", href: "/education", icon: BookOpen },
];

const STATS = [
  { label: "Asset classes", value: "6", detail: "Forex to crypto" },
  { label: "Live instruments", value: "40+", detail: "Updated continuously" },
  { label: "Market hours", value: "24/7", detail: "Global coverage" },
];

function HeroChartGraphic() {
  return (
    <div className="relative h-full min-h-[280px] w-full p-6 lg:min-h-[340px]">
      <div className="absolute inset-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]" />
      <svg
        viewBox="0 0 400 200"
        className="absolute inset-x-8 bottom-16 top-12 w-[calc(100%-4rem)] text-brand/80"
        aria-hidden
      >
        <defs>
          <linearGradient id="heroLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(42 62% 58% / 0.2)" />
            <stop offset="50%" stopColor="hsl(42 62% 58% / 0.9)" />
            <stop offset="100%" stopColor="hsl(168 45% 46% / 0.7)" />
          </linearGradient>
          <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(42 62% 58% / 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0,140 C40,120 80,150 120,110 S200,80 240,95 S320,60 400,45 L400,200 L0,200 Z"
          fill="url(#heroFill)"
        />
        <path
          d="M0,140 C40,120 80,150 120,110 S200,80 240,95 S320,60 400,45"
          fill="none"
          stroke="url(#heroLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-4">
        {["EUR/USD", "BTC", "XAU"].map((sym, i) => (
          <div
            key={sym}
            className="surface-inset flex-1 rounded-xl px-3 py-2.5 backdrop-blur-sm"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {sym}
            </p>
            <p className="mt-1 font-display text-sm font-bold text-foreground">
              {["1.0842", "$62.4K", "$4,062"][i]}
            </p>
            <p
              className={`mt-0.5 font-mono text-[10px] ${i === 1 ? "text-positive" : i === 2 ? "text-negative" : "text-positive"}`}
            >
              {["+0.12%", "+1.8%", "-0.4%"][i]}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute right-8 top-8 flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-brand">
          Live feed
        </span>
      </div>
    </div>
  );
}

export function HeroStrip() {
  return (
    <section className="relative border-b border-white/[0.05]">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={STOCK_IMAGES.forex}
          alt=""
          fill
          className="object-cover opacity-[0.12]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="hero-frame">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:py-14">
              <div className="animate-fade-up">
                <p className="eyebrow">Institutional-grade market desk</p>
                <h1 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]">
                  Clarity at the speed of{" "}
                  <span className="gradient-text">global markets</span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-[17px]">
                  Live prices, syndicated wire news, editorial forecasts, and
                  structured education for traders who expect precision without
                  noise.
                </p>
              </div>

              <div className="mt-8 flex animate-fade-up-delay-1 flex-wrap gap-2.5">
                <Link
                  href="/markets"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-glow-sm transition-all hover:brightness-110"
                >
                  <LineChart className="h-4 w-4" />
                  Open markets
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/news"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-brand/25 hover:bg-brand/5"
                >
                  Read latest news
                </Link>
              </div>

              <div className="mt-10 grid animate-fade-up-delay-2 grid-cols-2 gap-3 lg:grid-cols-4">
                {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3 transition-all hover:border-brand/20 hover:bg-brand/[0.04]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand/70 transition-colors group-hover:text-brand" />
                    <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative border-t border-white/[0.05] lg:border-l lg:border-t-0">
              <HeroChartGraphic />
            </div>
          </div>

          <div className="grid border-t border-white/[0.05] sm:grid-cols-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`animate-fade-up-delay-3 px-6 py-5 sm:px-8 ${i > 0 ? "border-t border-white/[0.05] sm:border-l sm:border-t-0" : ""}`}
              >
                <p className="font-display text-3xl font-bold tracking-tight text-brand">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
