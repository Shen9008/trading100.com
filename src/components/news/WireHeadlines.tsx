import Link from "next/link";
import type { WireHeadline } from "@/lib/api/wire-types";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

type WireHeadlinesProps = {
  items: WireHeadline[];
  limit?: number;
  compact?: boolean;
};

export function WireHeadlines({
  items,
  limit = 8,
  compact = false,
}: WireHeadlinesProps) {
  const headlines = items.slice(0, limit);

  if (headlines.length === 0) {
    return (
      <GlassCard className="border-dashed border-white/[0.08]">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Market wire headlines appear here once{" "}
          <code className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-brand">
            FINNHUB_API_KEY
          </code>{" "}
          is configured.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding={false} className="overflow-hidden rounded-2xl">
      <ul className="divide-y divide-white/[0.05]">
        {headlines.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex cursor-pointer gap-3 px-5 py-4 transition-colors hover:bg-white/[0.025]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-foreground/75">{item.source}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={new Date(item.datetime * 1000).toISOString()}>
                    {formatRelativeTime(
                      new Date(item.datetime * 1000).toISOString()
                    )}
                  </time>
                </div>
                <p
                  className={`mt-1.5 font-display font-semibold leading-snug transition-colors group-hover:text-brand ${
                    compact ? "line-clamp-2 text-sm" : "text-[15px]"
                  }`}
                >
                  {item.headline}
                </p>
                {!compact && item.summary && (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                )}
              </div>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/[0.05] px-5 py-3.5">
        <Link
          href="/news"
          className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-[hsl(42,70%,72%)]"
        >
          Full newsroom →
        </Link>
      </div>
    </GlassCard>
  );
}
