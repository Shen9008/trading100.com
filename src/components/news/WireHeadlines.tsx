import Link from "next/link";
import type { WireHeadline } from "@/lib/api/wire-types";
import { GlassCard } from "@/components/layout/GlassCard";
import { formatRelativeTime } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

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
      <GlassCard className="border-dashed">
        <p className="text-sm text-muted-foreground">
          Market wire headlines appear here once{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-brand">
            NEWSAPI_API_KEY
          </code>{" "}
          is configured on Cloudflare.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding={false} className="overflow-hidden">
      <ul className="divide-y divide-white/[0.06]">
        {headlines.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {item.source}
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={new Date(item.datetime * 1000).toISOString()}>
                    {formatRelativeTime(
                      new Date(item.datetime * 1000).toISOString()
                    )}
                  </time>
                </div>
                <p
                  className={`mt-1 font-medium leading-snug transition-colors group-hover:text-brand ${
                    compact ? "line-clamp-2 text-sm" : "text-base"
                  }`}
                >
                  {item.headline}
                </p>
                {!compact && item.summary && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.summary}
                  </p>
                )}
              </div>
              <ExternalLink
                className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-brand"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/[0.06] px-4 py-3 sm:px-5">
        <Link
          href="/news"
          className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-amber-200"
        >
          All news & wire →
        </Link>
      </div>
    </GlassCard>
  );
}
