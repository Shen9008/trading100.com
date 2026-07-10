import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
    <div
      className={cn(
        "mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2
          id={id}
          className="mt-2 font-display text-2xl font-bold tracking-tight text-balance sm:text-[1.75rem]"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-brand/20 hover:text-brand"
        >
          {linkLabel}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
