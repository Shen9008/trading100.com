import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getHeroVariant,
  type HeroVariant,
} from "@/lib/hero/variants";
import { HeroGraphic } from "@/components/layout/HeroGraphics";
import { HeroAmbient, HeroLivePulse } from "@/components/layout/HeroAmbient";
import { isOptimizedImageHost } from "@/lib/constants/images";

type PageHeroBannerProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  variant?: HeroVariant;
  image?: string;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
  live?: boolean;
};

const VARIANT_HUE: Partial<Record<HeroVariant, number>> = {
  markets: 42,
  news: 210,
  forecasts: 168,
  education: 260,
  crypto: 270,
  commodities: 38,
  forex: 168,
  calendar: 15,
  converter: 200,
};

export function PageHeroBanner({
  title,
  description,
  eyebrow = "Trading 100",
  variant = "default",
  image,
  compact = false,
  className,
  children,
  live = false,
}: PageHeroBannerProps) {
  const config = getHeroVariant(variant);
  const bgImage = image ?? config.image;
  const useNextImage = isOptimizedImageHost(bgImage);
  const accentHue = VARIANT_HUE[variant] ?? 42;

  return (
    <header className={cn("animate-fade-up", className)}>
      <div
        className={cn(
          "hero-frame hero-banner-glow relative overflow-hidden",
          compact ? "min-h-[200px]" : "min-h-[260px] sm:min-h-[300px]"
        )}
      >
        {/* Ken Burns background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="hero-ken-burns absolute inset-0 scale-110">
            {useNextImage ? (
              <Image
                src={bgImage}
                alt=""
                aria-hidden
                fill
                className="object-cover opacity-35"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bgImage}
                alt=""
                aria-hidden
                className="h-full w-full object-cover opacity-35"
              />
            )}
          </div>
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(220 20% 6% / 0.88) 0%, hsl(220 20% 8% / 0.78) 40%, ${config.accentFrom} 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 90% 30%, ${config.accentTo}, transparent 65%)`,
          }}
        />

        {/* Animated ambient layer */}
        <HeroAmbient accentHue={accentHue} />

        {/* Scrolling mesh grid */}
        <div className="hero-grid-scroll pointer-events-none absolute inset-0 opacity-[0.05]" />

        {/* Content grid */}
        <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="max-w-2xl">
            <p className="eyebrow flex flex-wrap items-center gap-0">
              <span>{eyebrow}</span>
              {live && <HeroLivePulse />}
            </p>
            <h1
              className={cn(
                "mt-3 font-display font-extrabold tracking-tight text-balance text-foreground",
                compact
                  ? "text-2xl sm:text-3xl"
                  : "text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
            {children}
          </div>

          {!compact && (
            <div className="hidden h-32 w-56 shrink-0 md:block lg:h-36 lg:w-64">
              <div className="hero-graphic-panel relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-positive/5" />
                <HeroGraphic variant={config.graphic} className="relative h-full w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom edge glow line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      </div>
    </header>
  );
}
