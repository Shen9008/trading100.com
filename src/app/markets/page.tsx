import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { ASSET_CLASSES } from "@/lib/constants";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import { MarketDataTable } from "@/components/market/MarketDataTable";
import { InstrumentDirectory } from "@/components/market/InstrumentDirectory";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { countInstruments } from "@/lib/data/market-instruments";

export const metadata: Metadata = buildMetadata({
  title: "Markets",
  description:
    "Live prices for currencies, commodities, crypto, indices, stocks, and ETFs. Browse 250+ instruments with real-time charts.",
  path: "/markets",
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
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Markets", url: "https://trading100.com/markets" },
        ])}
      />

      <PageShell
        title="Markets"
        description={`Real-time quotes across ${instrumentCount}+ instruments — currencies, commodities, crypto, indices, stocks, and ETFs.`}
        eyebrow="Market Hub"
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
      </PageShell>
    </>
  );
}
