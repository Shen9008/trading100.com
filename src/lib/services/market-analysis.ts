import type { DailyInstrumentId } from "@/lib/forecasts/instrument-rotation";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import { fetchLatestRates } from "@/lib/api/frankfurter";
import { fetchFinnhubQuote } from "@/lib/api/finnhub";

export type ChartBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TrendLabel = "uptrend" | "downtrend" | "range";

export type MarketSnapshot = {
  instrumentId: DailyInstrumentId;
  label: string;
  price: number;
  changePct: number;
  sessionHigh: number;
  sessionLow: number;
  priorClose: number;
  bars: ChartBar[];
  sma20: number | null;
  sma50: number | null;
  rsi14: number | null;
  swingHigh: number;
  swingLow: number;
  trend: TrendLabel;
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
  pivot: number;
  priceDecimals: number;
  pricePrefix: string;
  priceSuffix: string;
  dataSource: string;
};

const YAHOO_SYMBOLS: Record<DailyInstrumentId, string> = {
  bitcoin: "BTC-USD",
  ethereum: "ETH-USD",
  "eur-usd": "EURUSD=X",
  "gbp-usd": "GBPUSD=X",
  "usd-jpy": "USDJPY=X",
  "aud-usd": "AUDUSD=X",
  "gold-xauusd": "GC=F",
  "silver-xagusd": "SI=F",
  "brent-crude": "BZ=F",
  sp500: "^GSPC",
  "nasdaq-100": "^NDX",
};

const PRICE_FORMAT: Record<
  DailyInstrumentId,
  { decimals: number; prefix: string; suffix: string }
> = {
  bitcoin: { decimals: 0, prefix: "$", suffix: "" },
  ethereum: { decimals: 0, prefix: "$", suffix: "" },
  "eur-usd": { decimals: 4, prefix: "", suffix: "" },
  "gbp-usd": { decimals: 4, prefix: "", suffix: "" },
  "usd-jpy": { decimals: 2, prefix: "", suffix: "" },
  "aud-usd": { decimals: 4, prefix: "", suffix: "" },
  "gold-xauusd": { decimals: 0, prefix: "$", suffix: "/oz" },
  "silver-xagusd": { decimals: 2, prefix: "$", suffix: "/oz" },
  "brent-crude": { decimals: 2, prefix: "$", suffix: "/bbl" },
  sp500: { decimals: 2, prefix: "", suffix: "" },
  "nasdaq-100": { decimals: 2, prefix: "", suffix: "" },
};

export function formatMarketPrice(
  value: number,
  decimals: number,
  prefix = "",
  suffix = ""
): string {
  return `${prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

function computeSMA(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((sum, v) => sum + v, 0) / period;
}

function computeRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function deriveTrend(
  price: number,
  sma20: number | null,
  sma50: number | null,
  closes: number[]
): TrendLabel {
  if (sma20 !== null && sma50 !== null) {
    if (price > sma20 && sma20 > sma50) return "uptrend";
    if (price < sma20 && sma20 < sma50) return "downtrend";
  }

  const recent = closes.slice(-8);
  if (recent.length < 4) return "range";

  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (change > 0.4) return "uptrend";
  if (change < -0.4) return "downtrend";
  return "range";
}

export function analyzeBars(
  bars: ChartBar[],
  instrumentId: DailyInstrumentId,
  label: string,
  dataSource: string,
  overrides?: Partial<
    Pick<
      MarketSnapshot,
      "price" | "changePct" | "sessionHigh" | "sessionLow" | "priorClose"
    >
  >
): MarketSnapshot | null {
  if (bars.length < 5) return null;

  const fmt = PRICE_FORMAT[instrumentId];
  const last = bars[bars.length - 1];
  const prior = bars[bars.length - 2] ?? last;

  const price = overrides?.price ?? last.close;
  const priorClose = overrides?.priorClose ?? prior.close;
  const changePct =
    overrides?.changePct ??
    (priorClose > 0 ? ((price - priorClose) / priorClose) * 100 : 0);

  const recentBars = bars.slice(-10);
  const sessionHigh =
    overrides?.sessionHigh ?? Math.max(...recentBars.map((b) => b.high));
  const sessionLow =
    overrides?.sessionLow ?? Math.min(...recentBars.map((b) => b.low));

  const closes = bars.map((b) => b.close);

  const sma20 = computeSMA(closes, 20);
  const sma50 = computeSMA(closes, 50);
  const rsi14 = computeRSI(closes, 14);
  const swingHigh = Math.max(...recentBars.map((b) => b.high));
  const swingLow = Math.min(...recentBars.map((b) => b.low));
  const trend = deriveTrend(price, sma20, sma50, closes);

  const resistance1 = Math.max(sessionHigh, swingHigh);
  const support1 = Math.min(sessionLow, swingLow);
  const span = resistance1 - support1;
  const resistance2 = resistance1 + span * 0.35;
  const support2 = support1 - span * 0.35;

  return {
    instrumentId,
    label,
    price,
    changePct,
    sessionHigh,
    sessionLow,
    priorClose,
    bars,
    sma20,
    sma50,
    rsi14,
    swingHigh,
    swingLow,
    trend,
    support1,
    support2: Math.max(support2, support1 * 0.985),
    resistance1,
    resistance2,
    pivot: price,
    priceDecimals: fmt.decimals,
    pricePrefix: fmt.prefix,
    priceSuffix: fmt.suffix,
    dataSource,
  };
}

export async function fetchYahooChart(
  symbol: string,
  range = "1mo"
): Promise<ChartBar[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`,
      { headers: { "User-Agent": "Trading100/1.0" }, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];

    const json = (await res.json()) as {
      chart?: {
        result?: {
          timestamp?: number[];
          indicators?: {
            quote?: {
              open?: (number | null)[];
              high?: (number | null)[];
              low?: (number | null)[];
              close?: (number | null)[];
            }[];
          };
        }[];
      };
    };

    const result = json.chart?.result?.[0];
    const timestamps = result?.timestamp ?? [];
    const quote = result?.indicators?.quote?.[0];
    if (!quote?.close?.length) return [];

    const bars: ChartBar[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = quote.close[i];
      const high = quote.high?.[i];
      const low = quote.low?.[i];
      const open = quote.open?.[i];
      if (close == null || high == null || low == null || open == null) continue;

      bars.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        open,
        high,
        low,
        close,
      });
    }

    return bars;
  } catch {
    return [];
  }
}

async function enrichCryptoSnapshot(
  id: "bitcoin" | "ethereum",
  label: string,
  bars: ChartBar[]
): Promise<MarketSnapshot | null> {
  const markets = await fetchCryptoMarkets();
  const coin = markets.find((c) => c.id === id);
  if (!coin) {
    return analyzeBars(bars, id, label, `Yahoo Finance (${YAHOO_SYMBOLS[id]})`);
  }

  return analyzeBars(bars, id, label, `CoinGecko + Yahoo Finance (${YAHOO_SYMBOLS[id]})`, {
    price: coin.current_price,
    changePct: coin.price_change_percentage_24h,
    sessionHigh: coin.high_24h,
    sessionLow: coin.low_24h,
    priorClose:
      coin.current_price /
      (1 + coin.price_change_percentage_24h / 100),
  });
}

async function enrichForexSnapshot(
  id: "eur-usd" | "gbp-usd" | "usd-jpy" | "aud-usd",
  label: string,
  bars: ChartBar[],
  currency: "EUR" | "GBP" | "JPY" | "AUD"
): Promise<MarketSnapshot | null> {
  const rates = await fetchLatestRates("USD", [currency]);
  let priceOverride: number | undefined;

  if (currency === "JPY") {
    priceOverride = rates.rates.JPY;
  } else {
    priceOverride = 1 / rates.rates[currency];
  }

  const snapshot = analyzeBars(
    bars,
    id,
    label,
    `Yahoo Finance (${YAHOO_SYMBOLS[id]}) + ECB fix ${rates.date}`
  );

  if (!snapshot || priceOverride === undefined) return snapshot;

  const priorClose = snapshot.priorClose;
  const changePct =
    priorClose > 0 ? ((priceOverride - priorClose) / priorClose) * 100 : 0;

  return {
    ...snapshot,
    price: priceOverride,
    changePct,
    pivot: priceOverride,
    dataSource: `Yahoo Finance (${YAHOO_SYMBOLS[id]}) + ECB reference ${rates.date}`,
  };
}

async function enrichGoldSnapshot(
  bars: ChartBar[]
): Promise<MarketSnapshot | null> {
  const gld = await fetchFinnhubQuote("GLD");
  const yahooLast = bars.at(-1)?.close;
  const price = yahooLast ?? (gld?.c ? gld.c * 10 : null);
  if (!price) return null;

  const changePct =
    bars.length >= 2 && bars[bars.length - 2].close > 0
      ? ((price - bars[bars.length - 2].close) / bars[bars.length - 2].close) *
        100
      : (gld?.dp ?? 0);

  return analyzeBars(
    bars,
    "gold-xauusd",
    "Gold (XAU/USD)",
    `Yahoo Finance (GC=F)${gld ? " + Finnhub GLD" : ""}`,
    { price, changePct }
  );
}

async function enrichIndexSnapshot(
  id: "sp500" | "nasdaq-100",
  label: string,
  bars: ChartBar[]
): Promise<MarketSnapshot | null> {
  if (id === "sp500") {
    const spy = await fetchFinnhubQuote("SPY");
    if (spy?.c && spy.c > 0) {
      return analyzeBars(
        bars,
        id,
        label,
        `Yahoo Finance (^GSPC) + Finnhub SPY`,
        {
          price: spy.c,
          changePct: spy.dp ?? undefined,
          sessionHigh: spy.h,
          sessionLow: spy.l,
          priorClose: spy.pc,
        }
      );
    }
  }

  return analyzeBars(bars, id, label, `Yahoo Finance (${YAHOO_SYMBOLS[id]})`);
}

export async function getInstrumentSnapshot(
  instrumentId: DailyInstrumentId,
  label: string
): Promise<MarketSnapshot | null> {
  const symbol = YAHOO_SYMBOLS[instrumentId];
  const bars = await fetchYahooChart(symbol);

  if (bars.length === 0) return null;

  switch (instrumentId) {
    case "bitcoin":
      return enrichCryptoSnapshot("bitcoin", label, bars);
    case "ethereum":
      return enrichCryptoSnapshot("ethereum", label, bars);
    case "eur-usd":
      return enrichForexSnapshot("eur-usd", label, bars, "EUR");
    case "gbp-usd":
      return enrichForexSnapshot("gbp-usd", label, bars, "GBP");
    case "usd-jpy":
      return enrichForexSnapshot("usd-jpy", label, bars, "JPY");
    case "aud-usd":
      return enrichForexSnapshot("aud-usd", label, bars, "AUD");
    case "gold-xauusd":
      return enrichGoldSnapshot(bars);
    case "silver-xagusd":
      return analyzeBars(
        bars,
        instrumentId,
        label,
        `Yahoo Finance (${symbol})`
      );
    case "brent-crude":
      return analyzeBars(
        bars,
        instrumentId,
        label,
        `Yahoo Finance (${symbol})`
      );
    case "sp500":
      return enrichIndexSnapshot("sp500", label, bars);
    case "nasdaq-100":
      return enrichIndexSnapshot("nasdaq-100", label, bars);
    default:
      return null;
  }
}

export function describeTrend(snapshot: MarketSnapshot): string {
  const { trend, swingHigh, swingLow, priceDecimals, pricePrefix, priceSuffix } =
    snapshot;
  const hi = formatMarketPrice(
    swingHigh,
    priceDecimals,
    pricePrefix,
    priceSuffix
  );
  const lo = formatMarketPrice(
    swingLow,
    priceDecimals,
    pricePrefix,
    priceSuffix
  );

  if (trend === "uptrend") {
    return `forming **higher lows** between ${lo} and ${hi}, with the latest close holding above recent swing support`;
  }
  if (trend === "downtrend") {
    return `showing **lower highs** between ${lo} and ${hi}, with rallies struggling below recent swing resistance`;
  }
  return `**range-bound** between ${lo} and ${hi}, with repeated tests of both boundaries and no sustained breakout`;
}

export function describeRsi(rsi: number | null): string {
  if (rsi === null) {
    return "RSI (14, daily) could not be computed from available chart data.";
  }
  if (rsi >= 70) {
    return `RSI (14, daily) reads **${rsi.toFixed(1)}** — overbought territory; upside extensions may face profit-taking unless momentum accelerates on volume.`;
  }
  if (rsi >= 55) {
    return `RSI (14, daily) reads **${rsi.toFixed(1)}** — constructive momentum without extreme overbought readings.`;
  }
  if (rsi >= 45) {
    return `RSI (14, daily) reads **${rsi.toFixed(1)}** — neutral momentum inside the current range; direction likely needs a catalyst.`;
  }
  if (rsi >= 30) {
    return `RSI (14, daily) reads **${rsi.toFixed(1)}** — soft momentum; bounces are possible but need confirmation above nearby resistance.`;
  }
  return `RSI (14, daily) reads **${rsi.toFixed(1)}** — oversold on the daily timeframe; watch for a relief bounce if support holds.`;
}

export function describeMovingAverages(snapshot: MarketSnapshot): string {
  const { price, sma20, sma50, priceDecimals, pricePrefix, priceSuffix } =
    snapshot;
  if (sma20 === null && sma50 === null) {
    return "Moving-average context is limited by available history.";
  }

  const parts: string[] = [];
  if (sma20 !== null) {
    const rel = price >= sma20 ? "above" : "below";
    parts.push(
      `the 20-day average near **${formatMarketPrice(sma20, priceDecimals, pricePrefix, priceSuffix)}** (spot is ${rel} it)`
    );
  }
  if (sma50 !== null) {
    const rel = price >= sma50 ? "above" : "below";
    parts.push(
      `the 50-day average near **${formatMarketPrice(sma50, priceDecimals, pricePrefix, priceSuffix)}** (spot is ${rel} it)`
    );
  }

  if (sma20 !== null && sma50 !== null) {
    if (price > sma20 && sma20 > sma50) {
      return `Price sits ${parts.join(" and ")}, consistent with a **bullish MA stack**.`;
    }
    if (price < sma20 && sma20 < sma50) {
      return `Price sits ${parts.join(" and ")}, consistent with a **bearish MA stack**.`;
    }
    return `Price is ${parts.join(" while ")}, signalling **mixed trend signals** until one average breaks decisively.`;
  }

  return `Price relative to ${parts.join(" and ")} defines the near-term trend filter.`;
}
