import type { Article } from "@/lib/data/articles";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import { fetchLatestRates } from "@/lib/api/frankfurter";
import { fetchFinnhubNews, fetchFinnhubQuote } from "@/lib/api/finnhub";

const IMAGES = {
  crypto:
    "https://images.unsplash.com/photo-1518546304927-5b4aa41e7635?w=800&q=80",
  forex:
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  indices:
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
  commodities:
    "https://images.unsplash.com/photo-1610375461244-0c3f1a0a5c0e?w=800&q=80",
};

function todaySlug(prefix: string): string {
  const d = new Date().toISOString().slice(0, 10);
  return `${prefix}-auto-${d}`;
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

export type GeneratorContext = {
  topHeadline?: string;
};

export async function generateDailyForecasts(): Promise<Article[]> {
  const now = new Date().toISOString();
  const forecasts: Article[] = [];
  let topHeadline: string | undefined;

  try {
    const news = await fetchFinnhubNews("general");
    topHeadline = news[0]?.headline;
  } catch {
    /* optional */
  }

  const macroNote = topHeadline
    ? `Today's dominant headline: "${topHeadline.slice(0, 120)}${topHeadline.length > 120 ? "…" : ""}".`
    : "Macro sentiment is driven by rates, USD strength, and energy prices.";

  // Crypto — Bitcoin
  try {
    const markets = await fetchCryptoMarkets();
    const btc = markets.find((c) => c.id === "bitcoin");
    const eth = markets.find((c) => c.id === "ethereum");

    if (btc) {
      const ch = btc.price_change_percentage_24h;
      const dir = ch >= 0 ? "firm" : "soft";
      const bandLow = Math.round(btc.current_price * 0.94);
      const bandHigh = Math.round(btc.current_price * 1.06);

      forecasts.push({
        slug: todaySlug("bitcoin"),
        title: `Bitcoin Daily Outlook: BTC ${dir.charAt(0).toUpperCase() + dir.slice(1)} at $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% 24h)`,
        excerpt: `Automated BTC forecast for ${now.slice(0, 10)}. ${macroNote}`,
        content: `${macroNote}

**Spot reference:** $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% over 24h)
**Market cap rank:** #${btc.market_cap_rank}

${buildScenarioBlock(
  `BTC holds a $${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)} range as ETF flows and front-end yields set the tone.`,
  `A risk-on session or softer rate pricing pushes BTC toward $${formatUsd(bandHigh * 1.04, 0)}.`,
  `A break below $${formatUsd(bandLow * 0.97, 0)} opens a quick move to prior support.`
)}`,
        category: "forecast",
        author: "Trading 100 Desk",
        publishedAt: now,
        image: IMAGES.crypto,
        isOriginal: true,
      });
    }

    if (eth) {
      const ch = eth.price_change_percentage_24h;
      forecasts.push({
        slug: todaySlug("ethereum"),
        title: `Ethereum Daily Outlook: ETH at $${formatUsd(eth.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% 24h)`,
        excerpt: `Automated ETH forecast based on live CoinGecko data — ${now.slice(0, 10)}.`,
        content: `**Spot reference:** $${formatUsd(eth.current_price, 0)}

${buildScenarioBlock(
  `ETH tracks BTC beta with a $${formatUsd(eth.current_price * 0.92, 0)}–$${formatUsd(eth.current_price * 1.08, 0)} band.`,
  `Network activity pickup + BTC strength could extend gains toward $${formatUsd(eth.current_price * 1.12, 0)}.`,
  `Risk-off or rate spike drags ETH toward $${formatUsd(eth.current_price * 0.88, 0)}.`
)}`,
        category: "forecast",
        author: "Trading 100 Desk",
        publishedAt: now,
        image: IMAGES.crypto,
        isOriginal: true,
      });
    }
  } catch {
    /* CoinGecko rate limit */
  }

  // Forex — EUR/USD, USD/JPY via Frankfurter (USD base)
  try {
    const rates = await fetchLatestRates("USD", [
      "EUR",
      "GBP",
      "JPY",
      "AUD",
    ]);
    const eurRate = rates.rates.EUR;
    const jpyRate = rates.rates.JPY;
    const eurusd = 1 / eurRate;
    const usdjpy = jpyRate;

    forecasts.push({
      slug: todaySlug("eur-usd"),
      title: `EUR/USD Daily Outlook: ${eurusd.toFixed(4)} (ECB rate ${rates.date})`,
      excerpt: `Automated EUR/USD levels from ECB reference data — ${now.slice(0, 10)}.`,
      content: `**Reference rate (ECB):** 1 EUR = ${eurRate.toFixed(4)} USD → EUR/USD ≈ ${eurusd.toFixed(4)}

${buildScenarioBlock(
  `EUR/USD oscillates in a 1% band around ${eurusd.toFixed(4)} unless US data shifts Fed hike odds.`,
  `Dollar softness or dovish Fed speak targets ${(eurusd * 1.012).toFixed(4)}.`,
  `USD safe-haven bid on geopolitical headlines risks ${(eurusd * 0.988).toFixed(4)}.`
)}`,
      category: "forecast",
      author: "Trading 100 Desk",
      publishedAt: now,
      image: IMAGES.forex,
      isOriginal: true,
    });

    forecasts.push({
      slug: todaySlug("usd-jpy"),
      title: `USD/JPY Daily Outlook: ${usdjpy.toFixed(2)} — Yield Spread in Focus`,
      excerpt: `Automated USD/JPY forecast from latest ECB cross rates — ${now.slice(0, 10)}.`,
      content: `**Derived cross:** USD/JPY ≈ ${usdjpy.toFixed(2)} (via ECB ${rates.date})

${buildScenarioBlock(
  `Pair grinds ${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)} unless US yields gap widens.`,
  `Higher US yields / oil-driven inflation fears push toward ${(usdjpy * 1.015).toFixed(2)} — watch intervention rhetoric.`,
  `Risk-off yen bid or softer US data pulls toward ${(usdjpy * 0.985).toFixed(2)}.`
)}`,
      category: "forecast",
      author: "Trading 100 Desk",
      publishedAt: now,
      image: IMAGES.forex,
      isOriginal: true,
    });
  } catch {
    /* Frankfurter */
  }

  // S&P 500 proxy via Finnhub SPY quote (if key set)
  try {
    const spy = await fetchFinnhubQuote("SPY");
    if (spy && spy.c > 0) {
      const ch = spy.dp;
      forecasts.push({
        slug: todaySlug("sp500"),
        title: `S&P 500 Daily Outlook: SPY ${spy.c.toFixed(2)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)`,
        excerpt: `Automated index outlook via SPY — ${now.slice(0, 10)}. ${macroNote}`,
        content: `**SPY reference:** $${spy.c.toFixed(2)} (day ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)
**Day range:** $${spy.l.toFixed(2)} – $${spy.h.toFixed(2)}

${buildScenarioBlock(
  `Index consolidates near ${spy.c.toFixed(0)} with mega-cap tech cushioning macro shocks.`,
  `De-escalation + soft inflation data reignites risk appetite toward ${(spy.c * 1.02).toFixed(2)}.`,
  `Geopolitical escalation or rate scare breaks ${(spy.c * 0.97).toFixed(2)} support.`
)}`,
        category: "forecast",
        author: "Trading 100 Desk",
        publishedAt: now,
        image: IMAGES.indices,
        isOriginal: true,
      });
    }
  } catch {
    /* Finnhub quotes optional */
  }

  return forecasts;
}
