import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { BRAND_ICON, BRAND_LOGO } from "@/lib/constants/brand";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  variant?: "header" | "footer" | "mark";
  className?: string;
  showTagline?: boolean;
};

export function SiteLogo({
  variant = "header",
  className,
  showTagline = true,
}: SiteLogoProps) {
  if (variant === "footer") {
    return (
      <Link href="/" className={cn("inline-block", className)} aria-label={`${SITE_NAME} home`}>
        <Image
          src={BRAND_LOGO}
          alt={SITE_NAME}
          width={200}
          height={133}
          className="h-auto w-[min(200px,50vw)]"
        />
      </Link>
    );
  }

  if (variant === "mark") {
    return (
      <Image
        src={BRAND_ICON}
        alt=""
        width={40}
        height={40}
        className={cn("h-10 w-10 rounded-xl", className)}
        priority
      />
    );
  }

  return (
    <Link
      href="/"
      className={cn("group flex cursor-pointer items-center gap-3", className)}
      aria-label={`${SITE_NAME} home`}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-brand/25 transition-all duration-300 group-hover:ring-brand/50 group-hover:shadow-glow-sm">
        <Image
          src={BRAND_ICON}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
          priority
        />
      </div>
      <div className="hidden flex-col leading-none sm:flex">
        <span className="font-display text-[15px] font-bold tracking-tight">
          <span className="text-brand">Trading</span>
          <span className="text-foreground/95">100</span>
        </span>
        {showTagline && (
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-luxury text-muted-foreground">
            Markets Intelligence
          </span>
        )}
      </div>
    </Link>
  );
}
