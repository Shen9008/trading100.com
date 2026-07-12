import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/metadata";
import { ASSET_CLASSES } from "@/lib/constants";
import { MARKET_INSTRUMENTS } from "@/lib/data/market-instruments";
import { getLatestArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { JsonLd, breadcrumbJsonLd, breadcrumbs, financialProductJsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { getInstrumentSeo } from "@/lib/seo/page-seo";
import { seoUrl } from "@/lib/seo/urls";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import { assetClassToHeroVariant } from "@/lib/hero/variants";

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

  const assetClassId =
    "assetClass" in resolved ? resolved.assetClass.id : ASSET_CLASSES.find((a) => a.slug === params["asset-class"])!.id;
  const assetClassLabel =
    "assetClass" in resolved ? resolved.assetClass.label : ASSET_CLASSES.find((a) => a.slug === params["asset-class"])!.label;

  const seo = getInstrumentSeo(
    resolved.name,
    resolved.symbol,
    assetClassId,
    assetClassLabel
  );

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/markets/${params["asset-class"]}/${params.symbol}`,
    ogImage: seo.ogImage,
    keywords: seo.keywords,
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
        data={financialProductJsonLd({
          name: instrument.name,
          symbol: instrument.symbol,
          url: seoUrl(`/markets/${params["asset-class"]}/${params.symbol}`),
          category: assetClass.label,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Markets", path: "/markets" },
            { name: assetClass.label, path: `/markets?tab=${assetClass.slug}` },
            {
              name: instrument.symbol,
              path: `/markets/${params["asset-class"]}/${params.symbol}`,
            },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <PageHeroBanner
          title={instrument.name}
          description={`Live ${instrument.symbol} price chart, key stats, and related market news.`}
          eyebrow={assetClass.label}
          variant={assetClassToHeroVariant(assetClass.id)}
          live
          compact
          className="mb-8"
        >
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{instrument.symbol}</Badge>
            <Badge>{assetClass.label}</Badge>
            <Link
              href="/markets"
              className="text-sm text-brand hover:underline"
            >
              ← Back to Markets
            </Link>
          </div>
        </PageHeroBanner>

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
