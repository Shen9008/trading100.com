import { cn } from "@/lib/utils";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import type { HeroVariant } from "@/lib/hero/variants";

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  variant?: HeroVariant;
  heroImage?: string;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  eyebrow = "Trading 100",
  variant = "default",
  heroImage,
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16", className)}>
      <PageHeroBanner
        title={title}
        description={description}
        eyebrow={eyebrow}
        variant={variant}
        image={heroImage}
        className="mb-12"
      />
      {children}
    </div>
  );
}
