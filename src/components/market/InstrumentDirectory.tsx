"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ASSET_CLASSES, type AssetClassId } from "@/lib/constants";
import {
  MARKET_INSTRUMENTS,
  getInstrumentGroups,
  instrumentHref,
  type MarketInstrument,
} from "@/lib/data/market-instruments";

type InstrumentDirectoryProps = {
  defaultTab?: AssetClassId;
};

function filterInstruments(
  instruments: MarketInstrument[],
  query: string
): MarketInstrument[] {
  const q = query.trim().toLowerCase();
  if (!q) return instruments;

  return instruments.filter(
    (item) =>
      item.symbol.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.group?.toLowerCase().includes(q) ?? false)
  );
}

export function InstrumentDirectory({
  defaultTab = "currencies",
}: InstrumentDirectoryProps) {
  const [search, setSearch] = useState("");

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        ASSET_CLASSES.map((ac) => [
          ac.id,
          MARKET_INSTRUMENTS[ac.id].length,
        ])
      ) as Record<AssetClassId, number>,
    []
  );

  const totalCount = useMemo(
    () => ASSET_CLASSES.reduce((sum, ac) => sum + tabCounts[ac.id], 0),
    [tabCounts]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          {totalCount} instruments across {ASSET_CLASSES.length} asset classes
        </p>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search symbol or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search instruments"
          />
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mb-6 h-auto flex-wrap justify-start">
          {ASSET_CLASSES.map((ac) => (
            <TabsTrigger key={ac.id} value={ac.id} className="gap-1.5">
              {ac.label}
              <span className="font-mono text-[10px] text-muted-foreground">
                ({tabCounts[ac.id]})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {ASSET_CLASSES.map((ac) => {
          const filtered = filterInstruments(MARKET_INSTRUMENTS[ac.id], search);
          const groups = getInstrumentGroups(filtered);

          return (
            <TabsContent key={ac.id} value={ac.id}>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No instruments match &ldquo;{search}&rdquo;
                </p>
              ) : (
                <div className="space-y-8">
                  {groups.map(({ group, items }) => (
                    <section key={group}>
                      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {group}
                        <span className="ml-2 text-brand/70">({items.length})</span>
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                          <Link
                            key={`${ac.id}-${item.symbol}`}
                            href={instrumentHref(ac.slug, item)}
                            className="glass-panel-hover group cursor-pointer p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate font-display font-semibold group-hover:text-brand">
                                  {item.symbol}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                                  {item.name}
                                </p>
                              </div>
                              <TrendingUp className="h-4 w-4 shrink-0 text-brand/40 transition-colors group-hover:text-brand" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
