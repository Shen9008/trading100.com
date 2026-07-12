import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getHeroVariant,
  type HeroVariant,
} from "@/lib/hero/variants";
import { HeroGraphic } from "@/components/layout/HeroGraphics";
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
}: PageHeroBannerProps) {
  const config = getHeroVariant(variant);
  const bgImage = image ?? config.image;
  const useNextImage = isOptimizedImageHost(bgImage);

  return (
    <header className={cn("animate-fade-up", className)}>
      <div
        className={cn(
          "hero-frame relative overflow-hidden",
          compact ? "min-h-[200px]" : "min-h-[240px] sm:min-h-[280px]"
        )}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {useNextImage ? (
            <Image
              src={bgImage}
              alt=""
              fill
              className="object-cover opacity-30"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bgImage}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
          )}
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsl(220 20% 6% / 0.92) 0%, hsl(220 20% 8% / 0.85) 45%, ${config.accentFrom} 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 85% 40%, ${config.accentTo}, transparent 70%)`,
          }}
        />

        {/* Decorative mesh grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(42 62% 58%) 1px, transparent 1px), linear-gradient(90deg, hsl(42 62% 58%) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating orbs */}
        <div className="pointer-events-none absolute -right-8 top-8 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-4 left-1/4 h-24 w-24 rounded-full bg-positive/10 blur-2xl" />

        {/* Content grid */}
        <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_auto] lg:gap-10">
          <div className="max-w-2xl">
            <p className="eyebrow">{eyebrow}</p>
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
            <div className="hidden h-28 w-52 shrink-0 opacity-90 lg:block xl:h-32 xl:w-60">
              <div className="surface-inset h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
                <HeroGraphic variant={config.graphic} className="h-full w-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
