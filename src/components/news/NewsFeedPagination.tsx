import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsFeedPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  basePath?: string;
  category?: string;
  className?: string;
};

function newsPageHref(page: number, category?: string, basePath = "/news") {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function NewsFeedPagination({
  page,
  totalPages,
  totalItems,
  perPage,
  basePath = "/news",
  category,
  className,
}: NewsFeedPaginationProps) {
  if (totalPages <= 1) return null;

  const start = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, totalItems);
  const prevHref = page > 1 ? newsPageHref(page - 1, category, basePath) : null;
  const nextHref =
    page < totalPages ? newsPageHref(page + 1, category, basePath) : null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="News pagination"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-center text-sm text-muted-foreground sm:text-left">
        Showing{" "}
        <span className="font-medium text-foreground">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>{" "}
        headlines · Page{" "}
        <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/20 hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground/40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum) => {
            const isActive = pageNum === page;
            return (
              <Link
                key={pageNum}
                href={newsPageHref(pageNum, category, basePath)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand/25 bg-brand/10 text-brand shadow-glow-sm"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-brand/15 hover:text-foreground"
                )}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-brand/20 hover:text-brand"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground/40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
