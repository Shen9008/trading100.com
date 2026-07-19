import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { buildMetadata } from "@/lib/metadata";

import { ASSET_CLASSES } from "@/lib/constants";

import { fetchCryptoMarkets } from "@/lib/api/coingecko";

import { MarketDataTable } from "@/components/market/MarketDataTable";

import { InstrumentDirectory } from "@/components/market/InstrumentDirectory";

import { PageShell } from "@/components/layout/PageShell";

import { GlassCard } from "@/components/layout/GlassCard";

import { SectionHeader } from "@/components/layout/SectionHeader";

import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { countInstruments } from "@/lib/data/market-instruments";
import { MARKETS_KEYWORDS } from "@/lib/seo/page-seo";

const TradingViewMarketMovers = dynamic(
  () =>
    import("@/components/widgets/TradingViewMarketMovers").then(
      (mod) => mod.TradingViewMarketMovers
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[420px] animate-pulse rounded-xl bg-white/5" />
    ),
  }
);

const TradingViewForexTable = dynamic(
  () =>
    import("@/components/widgets/TradingViewForexTable").then(
      (mod) => mod.TradingViewForexTable
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[360px] animate-pulse rounded-xl bg-white/5" />
    ),
  }
);

const TradingViewMarketData = dynamic(
  () =>
    import("@/components/widgets/TradingViewMarketData").then(
      (mod) => mod.TradingViewMarketData
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[480px] animate-pulse rounded-xl bg-white/5" />
    ),
  }
);

export const metadata: Metadata = buildMetadata({
  title: "Live Markets — Forex, Crypto, Stocks & Commodities",
  description:
    "Live prices for currencies, commodities, crypto, indices, stocks, and ETFs. Browse 250+ instruments with real-time TradingView charts and market data.",
  path: "/markets",
  keywords: MARKETS_KEYWORDS,
});



type MarketsPageProps = {

  searchParams: { tab?: string };

};



export default async function MarketsPage({ searchParams }: MarketsPageProps) {

  let cryptoData: Awaited<ReturnType<typeof fetchCryptoMarkets>> = [];

  try {

    cryptoData = await fetchCryptoMarkets();

  } catch {

    /* fallback */

  }



  const defaultTab =

    ASSET_CLASSES.find((a) => a.slug === searchParams.tab)?.id ?? "currencies";



  const instrumentCount = countInstruments();



  return (

    <>

      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Markets", path: "/markets" },
          ])
        )}
      />



      <PageShell
        title="Markets"
        description={`Real-time quotes across ${instrumentCount}+ instruments — currencies, commodities, crypto, indices, stocks, and ETFs.`}
        eyebrow="Market Hub"
        variant="markets"
        live
      >

        <GlassCard>

          <MarketDataTable cryptoData={cryptoData} defaultTab={defaultTab} />

        </GlassCard>



        <div className="mt-12">

          <SectionHeader

            title="All Instruments"

            subtitle="Full directory — major pairs, commodities, crypto, global indices, US stocks & ETFs"

            eyebrow="Directory"

          />

          <InstrumentDirectory defaultTab={defaultTab} />

        </div>



        <div className="mt-12">

          <SectionHeader

            title="Market Movers"

            subtitle="Top gainers and losers across global markets — powered by TradingView"

            eyebrow="Live Data"

          />

          <GlassCard className="p-4 sm:p-6">

            <TradingViewMarketMovers />

          </GlassCard>

        </div>



        <div className="mt-12">

          <SectionHeader

            title="Sector Performance"

            subtitle="Indices, commodities, stocks, and forex — live performance view"

            eyebrow="Market Data"

          />

          <GlassCard className="p-4 sm:p-6">

            <TradingViewMarketData />

          </GlassCard>

        </div>



        <div className="mt-12">

          <SectionHeader

            title="Forex Cross Rates"

            subtitle="Major currency crosses and live FX matrix — powered by TradingView"

            eyebrow="Currencies"

          />

          <GlassCard className="p-4 sm:p-6">

            <TradingViewForexTable />

          </GlassCard>

        </div>

      </PageShell>

    </>

  );

}


