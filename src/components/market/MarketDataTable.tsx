"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChangeBadge } from "@/components/market/PriceChangeBadge";
import { formatPrice } from "@/lib/utils";
import type { CoinGeckoMarket } from "@/lib/api/coingecko";
import { ASSET_CLASSES, type AssetClassId } from "@/lib/constants";
import { MarketOverviewWidget } from "@/components/widgets/MarketOverview";

type SortKey = "symbol" | "price" | "change" | "marketCap";

type MarketDataTableProps = {
  cryptoData?: CoinGeckoMarket[];
  defaultTab?: AssetClassId;
};

function MiniSparkline({ prices }: { prices: number[] }) {
  if (!prices?.length) return <span className="text-muted-foreground">—</span>;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const points = prices
    .slice(-20)
    .map((p, i, arr) => {
      const x = (i / (arr.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <svg width={w} height={h} className="inline-block" aria-hidden="true">
      <polyline
        fill="none"
        stroke={isUp ? "#16a34a" : "#dc2626"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

function CryptoTable({ data }: { data: CoinGeckoMarket[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "symbol":
          cmp = a.symbol.localeCompare(b.symbol);
          break;
        case "price":
          cmp = a.current_price - b.current_price;
          break;
        case "change":
          cmp = a.price_change_percentage_24h - b.price_change_percentage_24h;
          break;
        case "marketCap":
          cmp = a.market_cap - b.market_cap;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-brand"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="market-table-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">
              <SortHeader label="Symbol" col="symbol" />
            </th>
            <th className="px-3 py-2 text-right font-medium">
              <SortHeader label="Price" col="price" />
            </th>
            <th className="px-3 py-2 text-right font-medium">
              <SortHeader label="24h %" col="change" />
            </th>
            <th className="hidden px-3 py-2 text-right font-medium md:table-cell">
              24h High/Low
            </th>
            <th className="hidden px-3 py-2 text-right font-medium lg:table-cell">
              <SortHeader label="Market Cap" col="marketCap" />
            </th>
            <th className="px-3 py-2 text-right font-medium">7d</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((coin) => (
            <tr
              key={coin.id}
              className="interactive-row border-b border-white/[0.04]"
            >
              <td className="px-3 py-2 text-muted-foreground">{coin.market_cap_rank}</td>
              <td className="px-3 py-2">
                <Link
                  href={`/markets/crypto/${coin.id}`}
                  className="flex cursor-pointer items-center gap-2 font-medium transition-colors hover:text-brand"
                >
                  <Image
                    src={coin.image}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="uppercase">{coin.symbol}</span>
                  <span className="hidden text-muted-foreground sm:inline">
                    {coin.name}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                ${formatPrice(coin.current_price, coin.current_price < 1 ? 4 : 2)}
              </td>
              <td className="px-3 py-2 text-right">
                <PriceChangeBadge value={coin.price_change_percentage_24h} />
              </td>
              <td className="hidden px-3 py-2 text-right tabular-nums text-xs text-muted-foreground md:table-cell">
                ${formatPrice(coin.high_24h)} / ${formatPrice(coin.low_24h)}
              </td>
              <td className="hidden px-3 py-2 text-right tabular-nums lg:table-cell">
                {formatPrice(coin.market_cap, 0)}
              </td>
              <td className="px-3 py-2 text-right">
                <MiniSparkline prices={coin.sparkline_in_7d?.price ?? []} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TV_TAB_MAP: Record<AssetClassId, "forex" | "crypto" | "commodities" | "indices" | "stocks"> = {
  currencies: "forex",
  commodities: "commodities",
  crypto: "crypto",
  indices: "indices",
  stocks: "stocks",
  etfs: "stocks",
};

export function MarketDataTable({
  cryptoData = [],
  defaultTab = "currencies",
}: MarketDataTableProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList className="h-auto flex-wrap justify-start bg-transparent p-0 border-0">
          {ASSET_CLASSES.map((ac) => (
            <TabsTrigger
              key={ac.id}
              value={ac.id}
              className="rounded-lg border border-transparent px-4 py-2 data-[state=active]:border-brand/30 data-[state=active]:bg-brand/10"
            >
              {ac.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Link
          href="/markets"
          className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-amber-200"
        >
          View All →
        </Link>
      </div>

      {ASSET_CLASSES.map((ac) => (
        <TabsContent key={ac.id} value={ac.id} className="mt-4">
          {ac.id === "crypto" && cryptoData.length > 0 ? (
            <CryptoTable data={cryptoData} />
          ) : (
            <MarketOverviewWidget tab={TV_TAB_MAP[ac.id]} height={380} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
