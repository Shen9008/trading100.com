import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadataWithCanonical } from "@/lib/metadata";
import { getForecasts, type ForecastAssetFilter } from "@/lib/data/forecasts";
import { FeaturedArticleCard } from "@/components/articles/FeaturedArticleCard";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { cn } from "@/lib/utils";
import { getForecastFilterSeo } from "@/lib/seo/page-seo";
import { TradingViewTickers } from "@/components/widgets/TradingViewTickers";

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

export async function generateMetadata({
  searchParams,
}: ForecastsPageProps): Promise<Metadata> {
  const filter = searchParams.filter ?? "all";
  const seo = getForecastFilterSeo(filter);
  const path = filter === "all" ? "/forecasts" : `/forecasts?filter=${filter}`;

  return buildMetadataWithCanonical({
    title: seo.title,
    description: seo.description,
    path,
    canonicalPath: "/forecasts",
    keywords: seo.keywords,
  });
}

export default async function ForecastsPage({ searchParams }: ForecastsPageProps) {
  const filter = (searchParams.filter ?? "all") as ForecastAssetFilter;
  const forecasts = await getForecasts(filter);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Forecasts", path: "/forecasts" },
          ])
        )}
      />

      <PageShell
        title="Market Forecasts"
        description="Daily forex, crypto, gold, and stock index forecasts with technical levels, bull/bear scenarios, and educational outlooks."
        eyebrow="Outlook"
        variant="forecasts"
        live
      >
        <TradingViewTickers />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Browse in-house market forecasts updated daily. Each outlook covers key
          support and resistance levels, multi-timeframe analysis, and scenario
          planning for major forex pairs, Bitcoin, gold (XAU/USD), and global
          indices — for educational purposes only.
        </p>
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
              href={`/forecasts/${forecast.slug}`}
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
