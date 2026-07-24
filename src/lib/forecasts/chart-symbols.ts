import type { Article } from "@/lib/data/articles";
import type { DailyInstrumentId } from "@/lib/forecasts/instrument-rotation";
import { inferInstrumentFromArticle } from "@/lib/forecasts/instrument-rotation";

export type ForecastChartInterval = "D" | "W";

export type ForecastChartConfig = {
  symbol: string;
  interval: ForecastChartInterval;
  caption?: string;
};

/** TradingView symbols aligned with site market pages and ticker widgets. */
export const FORECAST_TV_SYMBOLS: Record<DailyInstrumentId, string> = {
  bitcoin: "BITSTAMP:BTCUSD",
  ethereum: "BITSTAMP:ETHUSD",
  "eur-usd": "FX:EURUSD",
  "gbp-usd": "OANDA:GBPUSD",
  "usd-jpy": "FX:USDJPY",
  "aud-usd": "OANDA:AUDUSD",
  "gold-xauusd": "OANDA:XAUUSD",
  "silver-xagusd": "TVC:SILVER",
  "brent-crude": "TVC:UKOIL",
  sp500: "SP:SPX",
  "nasdaq-100": "NASDAQ:NDX",
};

const CATEGORY_FALLBACK_SYMBOLS: Record<string, string> = {
  crypto: "BITSTAMP:BTCUSD",
  forex: "FX:EURUSD",
  commodities: "OANDA:XAUUSD",
  indices: "SP:SPX",
  stocks: "SP:SPX",
  forecast: "SP:SPX",
};

const CHART_LINE_RE = /\[CHART:\s*([^\]]+)\]/i;

export function extractChartCaption(content: string): string | null {
  const match = content.match(CHART_LINE_RE);
  return match?.[1]?.trim() ?? null;
}

export function stripChartPlaceholders(content: string): string {
  return content
    .replace(/\[CHART:\s*[^\]]+\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function intervalFromCaption(caption: string | null): ForecastChartInterval {
  if (!caption) return "D";
  return /\bweekly\b|\bweek\b/i.test(caption) ? "W" : "D";
}

export function resolveForecastChart(
  article: Pick<Article, "slug" | "title" | "excerpt" | "category" | "content">
): ForecastChartConfig | null {
  const caption = extractChartCaption(article.content);
  const interval = intervalFromCaption(caption);

  const instrumentId = inferInstrumentFromArticle(article);
  if (instrumentId) {
    return {
      symbol: FORECAST_TV_SYMBOLS[instrumentId],
      interval,
      caption: caption ?? undefined,
    };
  }

  const fallback = CATEGORY_FALLBACK_SYMBOLS[article.category];
  if (!fallback) return null;

  return {
    symbol: fallback,
    interval,
    caption: caption ?? undefined,
  };
}
