"use client";

import { TradingViewChart } from "@/components/widgets/TradingViewChart";
import type { ForecastChartInterval } from "@/lib/forecasts/chart-symbols";

type ForecastChartEmbedProps = {
  symbol: string;
  interval?: ForecastChartInterval;
  caption?: string;
};

export function ForecastChartEmbed({
  symbol,
  interval = "D",
  caption,
}: ForecastChartEmbedProps) {
  const timeframe = interval === "W" ? "Weekly" : "Daily";

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <figcaption className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Live {timeframe} Chart
        </p>
        {caption && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {caption}
          </p>
        )}
      </figcaption>
      <div className="p-1">
        <TradingViewChart symbol={symbol} interval={interval} height={480} mobileHeight={360} />
      </div>
    </figure>
  );
}
