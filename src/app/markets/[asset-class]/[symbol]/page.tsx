import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/metadata";
import { ASSET_CLASSES } from "@/lib/constants";
import { MARKET_INSTRUMENTS } from "@/lib/data/market-instruments";
import { getLatestArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";

const TradingViewChart = dynamic(
  () => import("@/components/widgets/TradingViewChart").then((m) => m.TradingViewChart),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse rounded-lg bg-muted" /> }
);

const SymbolOverviewWidget = dynamic(
  () => import("@/components/widgets/SymbolOverview").then((m) => m.SymbolOverviewWidget),
  { ssr: false }
);

type InstrumentPageProps = {
  params: { "asset-class": string; symbol: string };
};

function resolveInstrument(assetClass: string, symbolSlug: string) {
  const ac = ASSET_CLASSES.find((a) => a.slug === assetClass);
  if (!ac) return null;

  const normalized = symbolSlug.replace(/-/g, "/").toUpperCase();
  const altNormalized = symbolSlug.toUpperCase();

  const instrument = MARKET_INSTRUMENTS[ac.id].find(
    (s) =>
      s.slug?.toLowerCase() === symbolSlug.toLowerCase() ||
      s.symbol.replace("/", "-").toLowerCase() === symbolSlug.toLowerCase() ||
      s.symbol.toUpperCase() === normalized ||
      s.symbol.toUpperCase() === altNormalized ||
      s.name.toLowerCase().replace(/\s+/g, "-") === symbolSlug.toLowerCase()
  );

  if (!instrument && ac.id === "crypto") {
    return {
      symbol: altNormalized,
      name: altNormalized,
      tvSymbol: `BINANCE:${altNormalized}USDT`,
      slug: symbolSlug.toLowerCase(),
    };
  }

  return instrument ? { ...instrument, assetClass: ac } : null;
}

export async function generateStaticParams() {
  const params: { "asset-class": string; symbol: string }[] = [];
  for (const ac of ASSET_CLASSES) {
    for (const item of MARKET_INSTRUMENTS[ac.id]) {
      const slug =
        item.slug ?? item.symbol.toLowerCase().replace("/", "-");
      params.push({
        "asset-class": ac.slug,
        symbol: slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: InstrumentPageProps): Promise<Metadata> {
  const resolved = resolveInstrument(params["asset-class"], params.symbol);
  if (!resolved) return buildMetadata({ title: "Instrument Not Found", noIndex: true });

  return buildMetadata({
    title: `${resolved.name} (${resolved.symbol}) Price & Chart`,
    description: `Live ${resolved.name} price, chart, key stats, and related news on Trading 100.`,
    path: `/markets/${params["asset-class"]}/${params.symbol}`,
  });
}

export default function InstrumentPage({ params }: InstrumentPageProps) {
  const resolved = resolveInstrument(params["asset-class"], params.symbol);
  if (!resolved || !("assetClass" in resolved)) notFound();

  const { assetClass, ...instrument } = resolved;
  const relatedNews = getLatestArticles(5).filter((a) => {
    if (assetClass.id === "crypto") return a.category === "crypto";
    if (assetClass.id === "currencies") return a.category === "forex";
    if (assetClass.id === "commodities") return a.category === "commodities";
    if (assetClass.id === "indices" || assetClass.id === "stocks")
      return a.category === "stocks" || a.category === "indices";
    return true;
  });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Markets", url: "https://trading100.com/markets" },
          {
            name: assetClass.label,
            url: `https://trading100.com/markets?tab=${assetClass.slug}`,
          },
          {
            name: instrument.symbol,
            url: `https://trading100.com/markets/${params["asset-class"]}/${params.symbol}`,
          },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{instrument.name}</h1>
            <Badge variant="outline">{instrument.symbol}</Badge>
            <Badge>{assetClass.label}</Badge>
          </div>
          <Link
            href="/markets"
            className="mt-2 inline-block text-sm text-brand hover:underline"
          >
            ← Back to Markets
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TradingViewChart symbol={instrument.tvSymbol} height={520} />
          </div>
          <div>
            <SymbolOverviewWidget symbol={instrument.tvSymbol} height={520} />
          </div>
        </div>

        <section className="mt-10" aria-labelledby="related-news">
          <h2 id="related-news" className="mb-4 text-xl font-bold">
            Related News
          </h2>
          <div className="rounded-lg border bg-card px-4">
            {relatedNews.length > 0 ? (
              relatedNews.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))
            ) : (
              <p className="py-6 text-muted-foreground">No related articles yet.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
