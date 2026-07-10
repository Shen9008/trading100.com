import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getForecasts, type ForecastAssetFilter } from "@/lib/data/forecasts";
import { FeaturedArticleCard } from "@/components/articles/FeaturedArticleCard";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Market Forecasts",
  description:
    "Expert market forecasts for forex, crypto, commodities, indices, and stocks.",
  path: "/forecasts",
});

const FILTERS: { id: ForecastAssetFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "forex", label: "Forex" },
  { id: "crypto", label: "Crypto" },
  { id: "commodities", label: "Commodities" },
  { id: "indices", label: "Indices" },
  { id: "stocks", label: "Stocks" },
];

type ForecastsPageProps = {
  searchParams: { filter?: string };
};

export default async function ForecastsPage({ searchParams }: ForecastsPageProps) {
  const filter = (searchParams.filter ?? "all") as ForecastAssetFilter;
  const forecasts = await getForecasts(filter);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Forecasts", url: "https://trading100.com/forecasts" },
        ])}
      />

      <PageShell
        title="Market Forecasts"
        description="In-house outlooks and scenario analysis. For educational purposes only."
        eyebrow="Outlook"
      >
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={f.id === "all" ? "/forecasts" : `/forecasts?filter=${f.id}`}
              className={cn(
                "cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200",
                filter === f.id
                  ? "border-brand/25 bg-brand/10 text-brand shadow-glow-sm"
                  : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-brand/15 hover:text-foreground"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forecasts.map((forecast) => (
            <FeaturedArticleCard
              key={forecast.slug}
              article={forecast}
              href={`/news/${forecast.slug}`}
            />
          ))}
        </div>

        {forecasts.length === 0 && (
          <p className="mt-8 text-muted-foreground">No forecasts for this filter yet.</p>
        )}
      </PageShell>
    </>
  );
}
