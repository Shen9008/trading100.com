import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  id?: string;
  eyebrow?: string;
};

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  className,
  id,
  eyebrow = "Live Data",
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-brand to-transparent" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand">
            {eyebrow}
          </span>
        </div>
        <h2 id={id} className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-amber-200"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
