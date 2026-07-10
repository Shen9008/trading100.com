import type { Article } from "@/lib/data/articles";
import { STOCK_IMAGES } from "@/lib/constants/images";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import { fetchLatestRates } from "@/lib/api/frankfurter";
import { fetchFinnhubQuote } from "@/lib/api/finnhub";

const IMAGES = {
  crypto: STOCK_IMAGES.crypto,
  forex: STOCK_IMAGES.forex,
  indices: STOCK_IMAGES.indices,
  commodities: STOCK_IMAGES.gold,
};

/** Five most-traded instruments refreshed every day by the analysis subagent. */
export const DAILY_INSTRUMENT_IDS = [
  "bitcoin",
  "eur-usd",
  "gold-xauusd",
  "sp500",
  "usd-jpy",
] as const;

function todaySlug(prefix: string): string {
  return `${prefix}-auto-${new Date().toISOString().slice(0, 10)}`;
}

function formatUsd(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function buildScenarioBlock(
  base: string,
  bull: string,
  bear: string
): string {
  return `## Base case (55%)
${base}

## Bull case (25%)
${bull}

## Bear case (20%)
${bear}

*Auto-generated daily outlook from public market data. For educational purposes only — not financial advice.*`;
}

async function fetchYahooPrice(symbol: string): Promise<{
  price: number;
  changePct: number;
} | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      { headers: { "User-Agent": "Trading100/1.0" } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: {
        result?: {
          meta?: { regularMarketPrice?: number; chartPreviousClose?: number };
        }[];
      };
    };
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;
    const prev = meta.chartPreviousClose ?? meta.regularMarketPrice;
    const changePct =
      prev > 0
        ? ((meta.regularMarketPrice - prev) / prev) * 100
        : 0;
    return { price: meta.regularMarketPrice, changePct };
  } catch {
    return null;
  }
}

async function getTopHeadline(): Promise<string | undefined> {
  try {
    const { getWireHeadlines } = await import("@/lib/api/wire-news");
    const news = await getWireHeadlines(1);
    return news[0]?.headline;
  } catch {
    return undefined;
  }
}

async function generateBitcoin(
  now: string,
  macroNote: string
): Promise<Article | null> {
  const markets = await fetchCryptoMarkets();
  const btc = markets.find((c) => c.id === "bitcoin");
  if (!btc) return null;

  const ch = btc.price_change_percentage_24h;
  const dir = ch >= 0 ? "firm" : "soft";
  const bandLow = Math.round(btc.current_price * 0.94);
  const bandHigh = Math.round(btc.current_price * 1.06);

  return {
    slug: todaySlug("bitcoin"),
    title: `Bitcoin Daily Analysis: BTC ${dir.charAt(0).toUpperCase() + dir.slice(1)} at $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% 24h)`,
    excerpt: `Daily BTC analysis for ${now.slice(0, 10)}. ${macroNote}`,
    content: `${macroNote}

**Spot reference:** $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% over 24h)
**24h range:** $${formatUsd(btc.low_24h, 0)} – $${formatUsd(btc.high_24h, 0)}

${buildScenarioBlock(
  `BTC holds a $${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)} range as ETF flows and front-end yields set the tone.`,
  `Risk-on or softer rate pricing pushes BTC toward $${formatUsd(bandHigh * 1.04, 0)}.`,
  `A break below $${formatUsd(bandLow * 0.97, 0)} opens a quick move to prior support.`
)}`,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES.crypto,
    isOriginal: true,
  };
}

async function generateEurUsd(
  now: string,
  macroNote: string
): Promise<Article | null> {
  const rates = await fetchLatestRates("USD", ["EUR"]);
  const eurusd = 1 / rates.rates.EUR;

  return {
    slug: todaySlug("eur-usd"),
    title: `EUR/USD Daily Analysis: ${eurusd.toFixed(4)} (ECB ${rates.date})`,
    excerpt: `Daily EUR/USD levels from ECB reference data — ${now.slice(0, 10)}.`,
    content: `${macroNote}

**Reference rate (ECB):** 1 EUR = ${rates.rates.EUR.toFixed(4)} USD → EUR/USD ≈ ${eurusd.toFixed(4)}

${buildScenarioBlock(
  `EUR/USD oscillates in a 1% band around ${eurusd.toFixed(4)} unless US data shifts Fed pricing.`,
  `Dollar softness targets ${(eurusd * 1.012).toFixed(4)}.`,
  `USD safe-haven bid risks ${(eurusd * 0.988).toFixed(4)}.`
)}`,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES.forex,
    isOriginal: true,
  };
}

async function generateUsdJpy(
  now: string,
  macroNote: string
): Promise<Article | null> {
  const rates = await fetchLatestRates("USD", ["JPY"]);
  const usdjpy = rates.rates.JPY;

  return {
    slug: todaySlug("usd-jpy"),
    title: `USD/JPY Daily Analysis: ${usdjpy.toFixed(2)} — Yield Spread in Focus`,
    excerpt: `Daily USD/JPY analysis from ECB cross rates — ${now.slice(0, 10)}.`,
    content: `${macroNote}

**Derived cross:** USD/JPY ≈ ${usdjpy.toFixed(2)} (via ECB ${rates.date})

${buildScenarioBlock(
  `Pair grinds ${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)} unless US–Japan yield gap widens.`,
  `Higher US yields push toward ${(usdjpy * 1.015).toFixed(2)} — watch intervention rhetoric near 160+.`,
  `Risk-off yen bid pulls toward ${(usdjpy * 0.985).toFixed(2)}.`
)}`,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES.forex,
    isOriginal: true,
  };
}

async function generateGold(now: string, macroNote: string): Promise<Article> {
  const yahoo = await fetchYahooPrice("GC=F");
  const gld = await fetchFinnhubQuote("GLD");
  const price = yahoo?.price ?? (gld?.c ? gld.c * 10 : null);
  const ch = yahoo?.changePct ?? gld?.dp ?? 0;

  const priceLine = price
    ? `**Spot reference:** ~$${formatUsd(price, 0)}/oz (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)`
    : `**Spot reference:** Gold consolidating near recent highs as real yields and USD set direction.`;

  return {
    slug: todaySlug("gold-xauusd"),
    title: price
      ? `Gold (XAU/USD) Daily Analysis: ~$${formatUsd(price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)`
      : `Gold (XAU/USD) Daily Analysis: Safe-Haven Bid vs. Real Yields`,
    excerpt: `Daily gold outlook — ${now.slice(0, 10)}. ${macroNote}`,
    content: `${macroNote}

${priceLine}

${buildScenarioBlock(
  price
    ? `Gold holds $${formatUsd(price * 0.98, 0)}–$${formatUsd(price * 1.02, 0)} as markets balance inflation hedging vs. higher-for-longer rates.`
    : `Gold trades in a defensive range as geopolitical headlines compete with firm US yields.`,
  price
    ? `Escalation or softer USD drives a test of $${formatUsd(price * 1.04, 0)}.`
    : `Escalation or softer USD reignites safe-haven flows toward prior highs.`,
  price
    ? `A hawkish Fed repricing or USD squeeze risks $${formatUsd(price * 0.96, 0)}.`
    : `Hawkish Fed repricing or USD squeeze caps upside near recent resistance.`
)}`,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES.commodities,
    isOriginal: true,
  };
}

async function generateSp500(
  now: string,
  macroNote: string
): Promise<Article | null> {
  const spy = await fetchFinnhubQuote("SPY");
  const yahoo = await fetchYahooPrice("^GSPC");
  const price = spy?.c && spy.c > 0 ? spy.c : yahoo?.price;
  const ch = spy?.dp ?? yahoo?.changePct ?? 0;

  if (!price) return null;

  return {
    slug: todaySlug("sp500"),
    title: `S&P 500 Daily Analysis: ${price.toFixed(2)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)`,
    excerpt: `Daily index outlook — ${now.slice(0, 10)}. ${macroNote}`,
    content: `${macroNote}

**Reference:** ${price.toFixed(2)} (day ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)
${spy ? `**Day range:** $${spy.l.toFixed(2)} – $${spy.h.toFixed(2)}` : ""}

${buildScenarioBlock(
  `Index consolidates near ${price.toFixed(0)} with mega-cap tech cushioning macro shocks.`,
  `Soft inflation data reignites risk appetite toward ${(price * 1.02).toFixed(2)}.`,
  `Rate scare or geopolitical escalation breaks ${(price * 0.97).toFixed(2)} support.`
)}`,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES.indices,
    isOriginal: true,
  };
}

/** Fallback analysis when live data is unavailable for an instrument. */
function fallbackForecast(
  id: (typeof DAILY_INSTRUMENT_IDS)[number],
  now: string,
  macroNote: string
): Article {
  const templates: Record<
    (typeof DAILY_INSTRUMENT_IDS)[number],
    { title: string; content: string; image: string }
  > = {
    bitcoin: {
      title: "Bitcoin Daily Analysis: Range-Bound Ahead of Macro Data",
      content: `${macroNote}\n\nBTC traders are watching US yields and ETF flow data for direction.\n\n${buildScenarioBlock("Consolidation near recent pivot.", "Breakout on risk-on flows.", "Pullback on USD strength.")}`,
      image: IMAGES.crypto,
    },
    "eur-usd": {
      title: "EUR/USD Daily Analysis: ECB vs. Fed Pricing in Focus",
      content: `${macroNote}\n\n${buildScenarioBlock("Range trade near fair value.", "Euro gains on soft US data.", "Dollar bid on safe-haven flows.")}`,
      image: IMAGES.forex,
    },
    "gold-xauusd": {
      title: "Gold (XAU/USD) Daily Analysis: Real Yields vs. Haven Demand",
      content: `${macroNote}\n\n${buildScenarioBlock("Gold holds defensive bid.", "Geopolitical escalation lifts XAU.", "Higher real yields cap upside.")}`,
      image: IMAGES.commodities,
    },
    sp500: {
      title: "S&P 500 Daily Analysis: Mega-Caps Anchor Index",
      content: `${macroNote}\n\n${buildScenarioBlock("Index grinds sideways.", "Earnings beats extend rally.", "Macro shock triggers de-risking.")}`,
      image: IMAGES.indices,
    },
    "usd-jpy": {
      title: "USD/JPY Daily Analysis: Intervention Risk Near 160",
      content: `${macroNote}\n\n${buildScenarioBlock("Carry dynamics favor gradual USD strength.", "Yield gap widens toward 162+.", "Risk-off yen rally on headline de-escalation.")}`,
      image: IMAGES.forex,
    },
  };

  const t = templates[id];
  return {
    slug: todaySlug(id === "gold-xauusd" ? "gold-xauusd" : id),
    title: t.title,
    excerpt: `Daily ${id.replace(/-/g, "/")} analysis — ${now.slice(0, 10)}.`,
    content: t.content,
    category: "forecast",
    author: "Trading 100 Desk",
    publishedAt: now,
    image: t.image,
    isOriginal: true,
  };
}

export async function generateDailyForecasts(): Promise<Article[]> {
  const now = new Date().toISOString();
  const headline = await getTopHeadline();
  const macroNote = headline
    ? `Today's dominant headline: "${headline.slice(0, 120)}${headline.length > 120 ? "…" : ""}".`
    : "Macro sentiment is driven by rates, USD strength, and energy prices.";

  const generators: Record<
    (typeof DAILY_INSTRUMENT_IDS)[number],
    () => Promise<Article | null>
  > = {
    bitcoin: () => generateBitcoin(now, macroNote),
    "eur-usd": () => generateEurUsd(now, macroNote),
    "gold-xauusd": () => generateGold(now, macroNote).then((a) => a),
    sp500: () => generateSp500(now, macroNote),
    "usd-jpy": () => generateUsdJpy(now, macroNote),
  };

  const forecasts: Article[] = [];

  for (const id of DAILY_INSTRUMENT_IDS) {
    try {
      const article = await generators[id]();
      forecasts.push(article ?? fallbackForecast(id, now, macroNote));
    } catch {
      forecasts.push(fallbackForecast(id, now, macroNote));
    }
  }

  return forecasts;
}
