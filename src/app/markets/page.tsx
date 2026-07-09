import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { ASSET_CLASSES, MARKET_SYMBOLS } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import { MarketDataTable } from "@/components/market/MarketDataTable";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Markets",
  description:
    "Live prices for currencies, commodities, crypto, indices, stocks, and ETFs.",
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
        description="Real-time quotes across major asset classes. Select any instrument for live charts and related analysis."
        eyebrow="Market Hub"
      >
        <GlassCard>
          <MarketDataTable cryptoData={cryptoData} defaultTab={defaultTab} />
        </GlassCard>

        <div className="mt-12">
          <SectionHeader
            title="Browse Instruments"
            subtitle="Jump directly to any symbol"
            eyebrow="Directory"
          />
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-6">
              {ASSET_CLASSES.map((ac) => (
                <TabsTrigger key={ac.id} value={ac.id}>
                  {ac.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ASSET_CLASSES.map((ac) => (
              <TabsContent key={ac.id} value={ac.id}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {MARKET_SYMBOLS[ac.id].map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/markets/${ac.slug}/${item.symbol.toLowerCase().replace("/", "-")}`}
                      className="glass-panel-hover group cursor-pointer p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display font-semibold group-hover:text-brand">
                            {item.symbol}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {item.name}
                          </p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-brand/40 transition-colors group-hover:text-brand" />
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PageShell>
    </>
  );
}
