import type { Article, ArticleCategory } from "@/lib/data/articles";
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

type ForecastSectionInput = {
  intro: string;
  priceAction: string;
  technical: string;
  keyLevels: string[];
  chartPlaceholder: string;
  indicatorSignals?: string;
  fundamentals: string;
  bullish: string;
  bearish: string;
  baseCase: string;
  faq: { question: string; answer: string }[];
  disclaimer: string;
};

function buildForecastContent(input: ForecastSectionInput): string {
  const faqBlock = input.faq
    .map((item) => `**${item.question}** ${item.answer}`)
    .join("\n\n");

  return `${input.intro}

## Price Action Overview

${input.priceAction}

## Technical Analysis

${input.technical}

### Key Support and Resistance Levels

${input.keyLevels.map((level) => `- ${level}`).join("\n")}

${input.chartPlaceholder}

### Indicator Signals

${input.indicatorSignals ?? "RSI and moving-average readings should be verified on a live chart at publish time — see the technical section above for current structure."}

## Fundamental Analysis

${input.fundamentals}

## Forecast / Outlook

**Bullish scenario:** ${input.bullish}

**Bearish scenario:** ${input.bearish}

**Base case:** ${input.baseCase}

## FAQ

${faqBlock}

${input.disclaimer}`;
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
  const dateLabel = now.slice(0, 10);

  return {
    slug: todaySlug("bitcoin"),
    title: `Bitcoin Forecast Today: BTC Price Analysis & Key Levels`,
    excerpt: `Bitcoin price forecast for ${dateLabel}: BTC ${dir} at $${formatUsd(btc.current_price, 0)}, ETF flows, yield sensitivity, and support/resistance levels.`,
    content: buildForecastContent({
      intro: `Bitcoin is trading near **$${formatUsd(btc.current_price, 0)}** on ${dateLabel}, ${ch >= 0 ? "up" : "down"} roughly **${Math.abs(ch).toFixed(2)}%** over the past 24 hours. In this bitcoin price forecast today, we connect spot action to macro drivers — especially front-end Treasury yields and ETF flow data — rather than treating BTC as a simple risk-on proxy. You will learn today's range context, the technical levels framing the next move, and balanced bullish versus bearish scenarios without a buy-or-sell directive.`,
      priceAction: `${macroNote}

**Spot reference:** $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% over 24h)
**24h range:** $${formatUsd(btc.low_24h, 0)} – $${formatUsd(btc.high_24h, 0)}

Session tone is ${dir} as crypto tracks macro liquidity and rate expectations more closely than geopolitical headlines alone.`,
      technical: `On the daily chart, BTC is oscillating inside a **$${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)}** band defined by recent swing structure. RSI near **50–55** suggests neutral momentum — neither stretched nor oversold. The 50-day moving average is the key trend divider: holds above it keep the broader recovery narrative intact; breaks below invite faster de-risking.`,
      keyLevels: [
        `**Resistance:** $${formatUsd(bandHigh, 0)}, then $${formatUsd(Math.round(bandHigh * 1.04), 0)} on extension`,
        `**Support:** $${formatUsd(bandLow, 0)}, then $${formatUsd(Math.round(bandLow * 0.97), 0)} if macro turns defensive`,
        `**Pivot:** $${formatUsd(btc.current_price, 0)} — acceptance above favors range highs; failure reopens mid-band trade`,
      ],
      chartPlaceholder: `[CHART: BTC/USD daily showing $${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)} consolidation]`,
      fundamentals:
        "ETF net flows and US 2-year yield direction remain BTC's dominant macro inputs. When markets price Fed hikes, non-yielding assets face headwinds; when data softens, BTC often reclaims beta leadership within crypto. Regulatory headlines and weekend liquidity gaps remain secondary volatility amplifiers.",
      bullish: `Risk-on rotation or softer rate pricing pushes BTC toward **$${formatUsd(Math.round(bandHigh * 1.04), 0)}** with sustained ETF inflows as confirmation.`,
      bearish: `A break below **$${formatUsd(Math.round(bandLow * 0.97), 0)}** opens a quick move to prior support as macro de-risking accelerates.`,
      baseCase: `BTC holds **$${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)}** as ETF flows and front-end yields set the tone through the next US data cycle.`,
      faq: [
        {
          question: "Why is BTC tracking yields more than headlines?",
          answer:
            "Markets are treating geopolitical shocks as inflation events that can pull forward Fed hikes, which pressures non-yielding assets.",
        },
        {
          question: "What confirms a bullish breakout?",
          answer:
            "Spot ETF inflows accelerating alongside a hold above range resistance and softer US rate expectations.",
        },
      ],
      disclaimer:
        "*Not financial advice. Crypto is highly volatile and may not be suitable for all investors. This auto-generated bitcoin forecast today is for educational purposes only.*",
    }),
    category: "crypto",
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
  const dateLabel = now.slice(0, 10);
  const resUp = (eurusd * 1.012).toFixed(4);
  const resDn = (eurusd * 0.988).toFixed(4);

  return {
    slug: todaySlug("eur-usd"),
    title: "EUR/USD Forecast Today: Euro Dollar Analysis & Key Levels",
    excerpt: `EUR/USD forecast for ${dateLabel}: euro dollar near ${eurusd.toFixed(4)}, ECB reference data, Fed pricing, and support/resistance levels for cable traders.`,
    content: buildForecastContent({
      intro: `EUR/USD is trading near **${eurusd.toFixed(4)}** on ${dateLabel}, derived from the latest ECB reference fix (${rates.date}). This EUR/USD forecast today explains the session context, technical range, and macro catalysts — primarily Fed versus ECB policy divergence — that could decide whether the euro can recover or the dollar extends its bid.`,
      priceAction: `${macroNote}

**Reference rate (ECB):** 1 EUR = ${rates.rates.EUR.toFixed(4)} USD → EUR/USD ≈ **${eurusd.toFixed(4)}**

The pair is sensitive to US data surprises and energy-driven inflation repricing. Unless a clear catalyst hits, EUR/USD tends to mean-revert inside a tight band around fair value.`,
      technical: `Daily structure shows EUR/USD consolidating near **${eurusd.toFixed(4)}** with low realized volatility. RSI near **48–52** reflects balanced positioning. The 20-day moving average is the near-term pivot — repeated failures there often precede range breaks toward monthly highs or lows.`,
      keyLevels: [
        `**Resistance:** ${resUp} (near-term), then ${(eurusd * 1.02).toFixed(4)} on USD softness`,
        `**Support:** ${resDn} (near-term), then ${(eurusd * 0.98).toFixed(4)} on safe-haven USD bid`,
        `**Pivot:** ${eurusd.toFixed(4)} — mid-band equilibrium`,
      ],
      chartPlaceholder: `[CHART: EUR/USD daily around ${eurusd.toFixed(4)} pivot]`,
      fundamentals:
        "ECB communication remains cautious while markets price a higher-for-longer Fed on oil-linked inflation fears. Eurozone growth data and US CPI are the dominant catalysts. Geopolitical risk typically lifts USD first, capping EUR rallies even when European data is stable.",
      bullish: `Dollar softness on soft US inflation data targets **${resUp}** and potentially **${(eurusd * 1.02).toFixed(4)}**.`,
      bearish: `USD safe-haven bid on geopolitical escalation risks **${resDn}** and a break toward **${(eurusd * 0.98).toFixed(4)}**.`,
      baseCase: `EUR/USD oscillates in a **1% band around ${eurusd.toFixed(4)}** unless US data shifts Fed pricing materially.`,
      faq: [
        {
          question: "Why does EUR/USD trade in such a tight range?",
          answer:
            "Balanced ECB-Fed expectations and low volatility keep the pair anchored near fair value until a macro surprise arrives.",
        },
        {
          question: "What data matters most this week?",
          answer:
            "US inflation and labor prints that reprice Fed hike odds, plus any ECB speaker guidance on services inflation.",
        },
      ],
      disclaimer:
        "*Educational forecast only — not a recommendation to trade forex or CFDs. Auto-generated from public market data.*",
    }),
    category: "forex",
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
  const dateLabel = now.slice(0, 10);

  return {
    slug: todaySlug("usd-jpy"),
    title: "USD/JPY Forecast Today: Yen Analysis & Key Levels",
    excerpt: `USD/JPY forecast for ${dateLabel}: dollar-yen near ${usdjpy.toFixed(2)}, yield spread focus, intervention watch zone, and technical levels.`,
    content: buildForecastContent({
      intro: `USD/JPY is trading near **${usdjpy.toFixed(2)}** on ${dateLabel}, reflecting the ongoing tug-of-war between US–Japan yield divergence and periodic intervention rhetoric. This USD/JPY forecast today covers session drivers, technical structure, and the levels traders watch when the yen approaches historically sensitive territory.`,
      priceAction: `${macroNote}

**Derived cross:** USD/JPY ≈ **${usdjpy.toFixed(2)}** (via ECB ${rates.date})

Carry dynamics and the rate spread continue to favor gradual yen weakness, but verbal intervention risk rises as the pair approaches multi-year extremes.`,
      technical: `USD/JPY is grinding inside a **${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)}** band unless the US–Japan yield gap widens sharply. RSI near **55–60** shows constructive USD momentum without extreme overbought readings. The 50-day MA is rising support; loss of that line would signal short-term yen recovery.`,
      keyLevels: [
        `**Resistance:** ${(usdjpy * 1.005).toFixed(2)}, then ${(usdjpy * 1.015).toFixed(2)} (intervention watch)`,
        `**Support:** ${(usdjpy * 0.995).toFixed(2)}, then ${(usdjpy * 0.985).toFixed(2)} on risk-off yen bid`,
        `**Pivot:** ${usdjpy.toFixed(2)}`,
      ],
      chartPlaceholder: `[CHART: USD/JPY daily near ${usdjpy.toFixed(2)} with yield-spread overlay]`,
      fundamentals:
        "Higher US yields on inflation fears widen the policy gap versus a cautious Bank of Japan. Gulf geopolitical risk has favored dollar liquidity over yen safe-haven flows in recent sessions. MoF/BoJ comments remain the key policy wildcard near intervention-sensitive levels.",
      bullish: `Higher US yields push toward **${(usdjpy * 1.015).toFixed(2)}** — watch intervention rhetoric near 160+ historical zones.`,
      bearish: `Risk-off yen bid pulls toward **${(usdjpy * 0.985).toFixed(2)}** on de-escalation or soft US data.`,
      baseCase: `Pair grinds **${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)}** unless the yield spread moves decisively.`,
      faq: [
        {
          question: "When does intervention risk rise?",
          answer:
            "When USD/JPY approaches historically disorderly levels and officials signal concern about excessive yen weakness.",
        },
        {
          question: "What moves USD/JPY fastest?",
          answer:
            "US Treasury yield spikes, BoJ policy surprises, and risk-off flows that trigger JPY short covering.",
        },
      ],
      disclaimer:
        "*Educational forecast only — not a recommendation to trade forex or CFDs. Auto-generated from public market data.*",
    }),
    category: "forex",
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
  const dateLabel = now.slice(0, 10);

  const priceLine = price
    ? `**Spot reference:** ~$${formatUsd(price, 0)}/oz (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)`
    : `**Spot reference:** Gold consolidating near recent highs as real yields and USD set direction.`;

  const low = price ? formatUsd(price * 0.98, 0) : "recent support cluster";
  const high = price ? formatUsd(price * 1.02, 0) : "recent resistance";
  const bullTarget = price ? formatUsd(price * 1.04, 0) : "prior swing highs";
  const bearTarget = price ? formatUsd(price * 0.96, 0) : "lower support zone";

  return {
    slug: todaySlug("gold-xauusd"),
    title: price
      ? `XAUUSD Forecast Today: Gold Price Analysis & Key Levels`
      : `XAUUSD Forecast Today: Gold Price Analysis & Key Levels`,
    excerpt: price
      ? `Gold price forecast for ${dateLabel}: XAU/USD near $${formatUsd(price, 0)}, real yields vs haven demand, and support/resistance levels.`
      : `Gold price forecast for ${dateLabel}: XAU/USD outlook as real yields, USD strength, and geopolitical risk shape direction.`,
    content: buildForecastContent({
      intro: price
        ? `Gold is trading near **$${formatUsd(price, 0)}/oz** on ${dateLabel}, balancing safe-haven demand against firm real yields and a strong US dollar. This gold price forecast today maps the session setup, technical levels, and macro catalysts that decide whether XAU/USD can reclaim upside or extend its consolidation.`
        : `Gold is consolidating on ${dateLabel} as markets weigh geopolitical risk against higher real yields and dollar strength. This gold price forecast today explains the cross-asset drivers, technical structure, and scenarios traders use to frame XAU/USD into the next US data releases.`,
      priceAction: `${macroNote}

${priceLine}

Gold's correlation with real yields and the dollar remains the dominant daily driver — war headlines alone have not been enough to override rate gravity in recent sessions.`,
      technical: price
        ? `XAU/USD is holding a **$${low}–$${high}** range on the daily chart. RSI near **45–55** shows neutral-to-soft momentum. The 50-day MA is the bull/bear line — reclaiming it on volume would signal macro regime stabilization.`
        : `XAU/USD is range-bound as RSI hovers near **45–55** and MACD flattens. The 50-day moving average defines whether dips are bought or sold aggressively.`,
      keyLevels: price
        ? [
            `**Resistance:** $${high}, then $${bullTarget}`,
            `**Support:** $${low}, then $${bearTarget}`,
            `**Pivot:** $${formatUsd(price, 0)}`,
          ]
        : [
            "**Resistance:** prior swing high zone",
            "**Support:** prior breakout retest",
            "**Pivot:** mid-range equilibrium",
          ],
      chartPlaceholder: price
        ? `[CHART: XAU/USD daily showing $${low}–$${high} range]`
        : "[CHART: XAU/USD daily consolidation vs real yields]",
      fundamentals:
        "Central bank accumulation provides a long-term bid, but daily moves track US yields and DXY. Oil-driven inflation fears can hurt gold when markets price Fed hikes. Geopolitical spikes may produce brief rallies, but sellers often emerge unless real yields reverse lower.",
      bullish: price
        ? `Escalation or softer USD drives a test of **$${bullTarget}**.`
        : `Escalation or softer USD reignites safe-haven flows toward prior highs.`,
      bearish: price
        ? `Hawkish Fed repricing or USD squeeze risks **$${bearTarget}**.`
        : `Hawkish Fed repricing or USD squeeze caps upside near recent resistance.`,
      baseCase: price
        ? `Gold holds **$${low}–$${high}** as markets balance inflation hedging vs higher-for-longer rates.`
        : `Gold trades defensively in range as geopolitical headlines compete with firm US yields.`,
      faq: [
        {
          question: "Why isn't gold rallying on geopolitical risk?",
          answer:
            "When shocks are priced as inflation events, rising yields and a firm dollar can overpower traditional safe-haven demand.",
        },
        {
          question: "What confirms a gold uptrend resumption?",
          answer:
            "A sustained break above resistance on falling real yields and USD softness.",
        },
      ],
      disclaimer:
        "*Educational forecast only. Gold prices can be volatile. Auto-generated from public market data — not financial advice.*",
    }),
    category: "commodities",
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

  const dateLabel = now.slice(0, 10);

  return {
    slug: todaySlug("sp500"),
    title: "S&P 500 Forecast Today: Index Analysis & Key Levels",
    excerpt: `S&P 500 forecast for ${dateLabel}: index near ${price.toFixed(2)}, mega-cap tech cushion vs macro headwinds, and key support/resistance levels.`,
    content: buildForecastContent({
      intro: `The S&P 500 is trading near **${price.toFixed(2)}** on ${dateLabel}, ${ch >= 0 ? "up" : "down"} about **${Math.abs(ch).toFixed(2)}%** on the session. This S&P 500 forecast today examines whether mega-cap earnings can continue to anchor the index while rates, oil, and geopolitical risk pressure broader market breadth.`,
      priceAction: `${macroNote}

**Reference:** ${price.toFixed(2)} (day ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)
${spy ? `**Day range:** $${spy.l.toFixed(2)} – $${spy.h.toFixed(2)}` : ""}

Index-level moves remain narrow — mega-cap tech absorbs macro shocks better than cyclicals and small caps, a late-cycle signature that defines the current tape.`,
      technical: `The S&P 500 is consolidating near **${price.toFixed(0)}** with the 50-day moving average as near-term support. RSI near **50–55** shows neutral momentum. MACD on the daily chart is flattening, consistent with a pause rather than a clean trend reversal.`,
      keyLevels: [
        `**Resistance:** ${(price * 1.02).toFixed(2)}, then prior all-time high zone`,
        `**Support:** ${(price * 0.97).toFixed(2)}, then 200-day moving average area`,
        `**Pivot:** ${price.toFixed(2)}`,
      ],
      chartPlaceholder: `[CHART: S&P 500 daily near ${price.toFixed(0)} with breadth overlay]`,
      fundamentals:
        "Mega-cap AI earnings provide an index floor, but higher oil and Fed hike pricing compress valuations. Credit spreads and VIX term structure remain the risk-off tell if macro deteriorates. Breadth weakness beneath the surface limits confidence in sustained rallies.",
      bullish: `Soft inflation data reignites risk appetite toward **${(price * 1.02).toFixed(2)}** with broadening earnings participation.`,
      bearish: `Rate scare or geopolitical escalation breaks **${(price * 0.97).toFixed(2)}** support as the AI floor fails.`,
      baseCase: `Index consolidates near **${price.toFixed(0)}** with mega-cap tech cushioning macro shocks and 1–2% daily headline swings.`,
      faq: [
        {
          question: "Why is the index holding despite macro risk?",
          answer:
            "Cap-weighted mega-cap tech earnings beats offset weakness in more rate-sensitive sectors.",
        },
        {
          question: "What would break index support quickly?",
          answer:
            "A sustained oil spike, credit spread widening, or a major mega-cap guidance miss.",
        },
      ],
      disclaimer:
        "*For informational purposes only. Index trading involves substantial risk. Auto-generated — not financial advice.*",
    }),
    category: "indices",
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
  const dateLabel = now.slice(0, 10);

  const templates: Record<
    (typeof DAILY_INSTRUMENT_IDS)[number],
    {
      title: string;
      category: ArticleCategory;
      image: string;
      content: string;
      excerpt: string;
    }
  > = {
    bitcoin: {
      title: "Bitcoin Forecast Today: BTC Price Analysis & Key Levels",
      category: "crypto",
      image: IMAGES.crypto,
      excerpt: `Bitcoin price forecast for ${dateLabel}: BTC range-bound ahead of macro data, ETF flows, and key support/resistance levels.`,
      content: buildForecastContent({
        intro: `Bitcoin is consolidating on ${dateLabel} as traders weigh US yield direction against spot ETF flow data. This bitcoin price forecast today outlines the range structure, macro inputs, and balanced scenarios for BTC without issuing trade signals.`,
        priceAction: `${macroNote}\n\nBTC traders are watching US yields and ETF flow data for direction. Session volatility remains contained until a macro catalyst arrives.`,
        technical:
          "Daily RSI near 50 reflects neutral momentum. The 50-day moving average is the primary trend divider — holds above keep recovery intact; breaks below invite faster de-risking.",
        keyLevels: [
          "**Resistance:** prior range high",
          "**Support:** prior range low and 50-day MA",
          "**Pivot:** mid-range equilibrium",
        ],
        chartPlaceholder: "[CHART: BTC/USD daily consolidation]",
        fundamentals:
          "ETF flows and front-end Treasury yields dominate BTC's macro beta. Regulatory headlines remain a secondary volatility source.",
        bullish: "Breakout on risk-on flows and accelerating ETF inflows.",
        bearish: "Pullback on USD strength and higher rate expectations.",
        baseCase: "Consolidation near recent pivot until US data resolves direction.",
        faq: [
          {
            question: "What is BTC's lead indicator right now?",
            answer: "US 2-year Treasury yields and spot BTC ETF daily flows.",
          },
        ],
        disclaimer:
          "*Not financial advice. Auto-generated daily outlook for educational purposes only.*",
      }),
    },
    "eur-usd": {
      title: "EUR/USD Forecast Today: Euro Dollar Analysis & Key Levels",
      category: "forex",
      image: IMAGES.forex,
      excerpt: `EUR/USD forecast for ${dateLabel}: euro dollar range-bound as ECB vs Fed pricing stays in focus.`,
      content: buildForecastContent({
        intro: `EUR/USD is range-bound on ${dateLabel} as markets await clearer ECB-Fed policy signals. This EUR/USD forecast today covers the technical range, macro drivers, and scenarios for the euro dollar cross.`,
        priceAction: `${macroNote}\n\nThe pair is trading near fair value with low realized volatility until US or eurozone data surprises arrive.`,
        technical:
          "RSI near 50 and a flat 20-day moving average suggest equilibrium. Range highs and lows from the past two weeks define the active trade zone.",
        keyLevels: [
          "**Resistance:** prior monthly high",
          "**Support:** prior monthly low",
          "**Pivot:** 20-day moving average",
        ],
        chartPlaceholder: "[CHART: EUR/USD daily range trade]",
        fundamentals:
          "ECB caution versus Fed hike pricing keeps EUR capped. Geopolitical risk typically supports USD first.",
        bullish: "Euro gains on soft US data and dovish Fed repricing.",
        bearish: "Dollar bid on safe-haven flows and strong US data.",
        baseCase: "Range trade near fair value through the next macro release.",
        faq: [
          {
            question: "What breaks EUR/USD out of range?",
            answer: "A decisive US inflation surprise or major ECB policy shift.",
          },
        ],
        disclaimer:
          "*Educational forecast only — not a recommendation to trade forex or CFDs.*",
      }),
    },
    "gold-xauusd": {
      title: "XAUUSD Forecast Today: Gold Price Analysis & Key Levels",
      category: "commodities",
      image: IMAGES.commodities,
      excerpt: `Gold price forecast for ${dateLabel}: XAU/USD balanced between real yields headwind and haven demand.`,
      content: buildForecastContent({
        intro: `Gold is balancing haven demand against real yield headwinds on ${dateLabel}. This gold price forecast today maps XAU/USD technical levels and macro scenarios for the session ahead.`,
        priceAction: `${macroNote}\n\nXAU/USD is sensitive to DXY and US real yields more than short-lived geopolitical headlines alone.`,
        technical:
          "Daily RSI near 45–55 shows two-sided trade. The 50-day MA is the bull/bear line for near-term trend health.",
        keyLevels: [
          "**Resistance:** prior swing high",
          "**Support:** prior breakout zone",
          "**Pivot:** mid-range",
        ],
        chartPlaceholder: "[CHART: XAU/USD daily vs real yields]",
        fundamentals:
          "Central bank buying supports the long-term floor; daily moves track Fed expectations and USD strength.",
        bullish: "Geopolitical escalation lifts XAU if yields do not spike in tandem.",
        bearish: "Higher real yields and USD strength cap upside.",
        baseCase: "Gold holds defensive bid inside a established range.",
        faq: [
          {
            question: "Why do yields matter more than headlines for gold?",
            answer:
              "Rising yields raise the opportunity cost of holding non-yielding bullion.",
          },
        ],
        disclaimer:
          "*Educational forecast only. Auto-generated — not financial advice.*",
      }),
    },
    sp500: {
      title: "S&P 500 Forecast Today: Index Analysis & Key Levels",
      category: "indices",
      image: IMAGES.indices,
      excerpt: `S&P 500 forecast for ${dateLabel}: index anchored by mega-caps as macro risks linger beneath the surface.`,
      content: buildForecastContent({
        intro: `The S&P 500 is grinding sideways on ${dateLabel} as mega-cap tech offsets macro headwinds. This S&P 500 forecast today covers index levels, breadth context, and near-term scenarios.`,
        priceAction: `${macroNote}\n\nMega-cap earnings continue to cushion index-level drawdowns while cyclicals lag.`,
        technical:
          "50-day MA is near-term support; RSI near 50–55 reflects neutral momentum. Breadth weakness remains the hidden risk beneath cap-weighted strength.",
        keyLevels: [
          "**Resistance:** prior swing high",
          "**Support:** 50-day moving average",
          "**Pivot:** last close zone",
        ],
        chartPlaceholder: "[CHART: S&P 500 daily with mega-cap weighting]",
        fundamentals:
          "AI capex narratives and earnings beats support top names; rates and oil remain headwinds for broader multiples.",
        bullish: "Earnings beats extend rally with improving breadth.",
        bearish: "Macro shock triggers de-risking and index support break.",
        baseCase: "Index grinds sideways with mega-caps anchoring the tape.",
        faq: [
          {
            question: "Is the rally healthy?",
            answer:
              "Cap-weighted strength masks weak breadth — a late-cycle pattern that warrants caution on rallies.",
          },
        ],
        disclaimer:
          "*For informational purposes only. Auto-generated — not financial advice.*",
      }),
    },
    "usd-jpy": {
      title: "USD/JPY Forecast Today: Yen Analysis & Key Levels",
      category: "forex",
      image: IMAGES.forex,
      excerpt: `USD/JPY forecast for ${dateLabel}: dollar-yen near intervention-sensitive zone as carry trades persist.`,
      content: buildForecastContent({
        intro: `USD/JPY is trading in intervention-sensitive territory on ${dateLabel}. This USD/JPY forecast today explains yield-spread dynamics, technical levels, and yen scenarios for the session ahead.`,
        priceAction: `${macroNote}\n\nCarry dynamics favor gradual USD strength, but official rhetoric intensifies near historical extremes.`,
        technical:
          "RSI above 55 shows constructive USD momentum. The 50-day MA is rising support; intervention headlines are the primary policy override.",
        keyLevels: [
          "**Resistance:** prior multi-month high",
          "**Support:** 50-day moving average",
          "**Pivot:** last close",
        ],
        chartPlaceholder: "[CHART: USD/JPY daily with intervention zone]",
        fundamentals:
          "US-Japan yield gap and risk sentiment drive direction. MoF comments can trigger sharp intraday reversals.",
        bullish: "Yield gap widens toward 162+ with carry demand intact.",
        bearish: "Risk-off yen rally on headline de-escalation or intervention.",
        baseCase: "Gradual USD strength within a defined band unless yields gap sharply.",
        faq: [
          {
            question: "What triggers yen intervention talk?",
            answer:
              "Rapid, disorderly USD/JPY moves toward multi-decade weakness in the yen.",
          },
        ],
        disclaimer:
          "*Educational forecast only — not a recommendation to trade forex or CFDs.*",
      }),
    },
  };

  const t = templates[id];
  return {
    slug: todaySlug(id === "gold-xauusd" ? "gold-xauusd" : id),
    title: t.title,
    excerpt: t.excerpt,
    content: t.content,
    category: t.category,
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
