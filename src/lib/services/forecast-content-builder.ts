import type { Article, ArticleCategory } from "@/lib/data/articles";
import { STOCK_IMAGES } from "@/lib/constants/images";
import type { DailyInstrumentId } from "@/lib/forecasts/instrument-rotation";
import {
  type MarketSnapshot,
  describeMovingAverages,
  describeRsi,
  describeTrend,
  formatMarketPrice,
} from "@/lib/services/market-analysis";

const IMAGES: Record<string, string> = {
  crypto: STOCK_IMAGES.crypto,
  forex: STOCK_IMAGES.forex,
  indices: STOCK_IMAGES.indices,
  commodities: STOCK_IMAGES.gold,
};

const SLUG_PREFIX: Record<DailyInstrumentId, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  "eur-usd": "eur-usd",
  "gbp-usd": "gbp-usd",
  "usd-jpy": "usd-jpy",
  "aud-usd": "aud-usd",
  "gold-xauusd": "gold-xauusd",
  "silver-xagusd": "silver-xagusd",
  "brent-crude": "brent-crude",
  sp500: "sp500",
  "nasdaq-100": "nasdaq-100",
};

const TITLES: Record<DailyInstrumentId, string> = {
  bitcoin: "Bitcoin Forecast Today: BTC Price Analysis & Key Levels",
  ethereum: "Ethereum Forecast Today: ETH Price Analysis & Key Levels",
  "eur-usd": "EUR/USD Forecast Today: Euro Dollar Analysis & Key Levels",
  "gbp-usd": "GBP/USD Forecast Today: Cable Analysis & Key Levels",
  "usd-jpy": "USD/JPY Forecast Today: Yen Analysis & Key Levels",
  "aud-usd": "AUD/USD Forecast Today: Aussie Dollar Analysis & Key Levels",
  "gold-xauusd": "XAUUSD Forecast Today: Gold Price Analysis & Key Levels",
  "silver-xagusd": "XAGUSD Forecast Today: Silver Price Analysis & Key Levels",
  "brent-crude": "Brent Crude Forecast Today: Oil Price Analysis & Key Levels",
  sp500: "S&P 500 Forecast Today: Index Analysis & Key Levels",
  "nasdaq-100": "Nasdaq 100 Forecast Today: Index Analysis & Key Levels",
};

const CATEGORY: Record<DailyInstrumentId, ArticleCategory> = {
  bitcoin: "crypto",
  ethereum: "crypto",
  "eur-usd": "forex",
  "gbp-usd": "forex",
  "usd-jpy": "forex",
  "aud-usd": "forex",
  "gold-xauusd": "commodities",
  "silver-xagusd": "commodities",
  "brent-crude": "commodities",
  sp500: "indices",
  "nasdaq-100": "indices",
};

function fp(snapshot: MarketSnapshot, value: number): string {
  return formatMarketPrice(
    value,
    snapshot.priceDecimals,
    snapshot.pricePrefix,
    snapshot.priceSuffix
  );
}

function sessionDirection(changePct: number): string {
  if (changePct >= 0.5) return "firm";
  if (changePct <= -0.5) return "soft";
  return "mixed";
}

function buildFundamentals(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot,
  headline?: string
): string {
  const headlineNote = headline
    ? `Today's headline flow includes: "${headline.slice(0, 100)}${headline.length > 100 ? "…" : ""}". `
    : "";

  const drivers: Record<DailyInstrumentId, string> = {
    bitcoin: `${headlineNote}Bitcoin's session direction remains tied to **US front-end Treasury yields**, **spot BTC ETF net flows**, and the **US dollar**. With BTC ${snapshot.changePct >= 0 ? "firmer" : "softer"} at ${fp(snapshot, snapshot.price)}, traders are weighing whether rates pressure or risk appetite dominates. ETF inflow/outflow prints often explain whether dips toward ${fp(snapshot, snapshot.support1)} are bought or sold through.`,
    ethereum: `${headlineNote}Ethereum trades as **high-beta crypto** relative to Bitcoin, with additional sensitivity to **layer-2 activity**, **staking-product regulation**, and **DeFi liquidity**. ETH at ${fp(snapshot, snapshot.price)} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%) reflects whether altcoin breadth is improving or whether macro de-risking is compressing the entire crypto complex.`,
    "eur-usd": `${headlineNote}EUR/USD at ${fp(snapshot, snapshot.price)} reflects the **ECB–Fed policy gap**, **US inflation surprises**, and **energy-driven CPI repricing**. The euro often lags USD safe-haven bids on geopolitical headlines even when eurozone data is stable. Watch whether ${fp(snapshot, snapshot.resistance1)} caps rallies when US yields rise.`,
    "gbp-usd": `${headlineNote}Cable at ${fp(snapshot, snapshot.price)} balances **BoE rate expectations**, **UK growth data**, and **broad USD direction**. Sterling can outperform when UK inflation surprises hawkishly, but a firm dollar on US data often drags cable toward ${fp(snapshot, snapshot.support1)} regardless of domestic headlines.`,
    "usd-jpy": `${headlineNote}USD/JPY at ${fp(snapshot, snapshot.price)} is driven by the **US–Japan yield spread**, **carry positioning**, and **MoF/BoJ intervention rhetoric**. Wider rate differentials support gradual yen weakness, but verbal intervention risk rises as the pair approaches ${fp(snapshot, snapshot.resistance1)}. Risk-off episodes can trigger sharp JPY short-covering toward ${fp(snapshot, snapshot.support1)}.`,
    "aud-usd": `${headlineNote}AUD/USD at ${fp(snapshot, snapshot.price)} functions as an **APAC risk proxy**, linked to **China growth sentiment**, **iron ore demand**, and **global equity tone**. The aussie tends to lead or lag equity risk by a session — today's ${sessionDirection(snapshot.changePct)} tone ${snapshot.changePct >= 0 ? "supports" : "pressures"} commodity-linked FX.`,
    "gold-xauusd": `${headlineNote}Gold at ${fp(snapshot, snapshot.price)} balances **real-yield direction**, **USD strength**, and **safe-haven demand**. Geopolitical headlines alone rarely sustain rallies when shocks are priced as inflation events that lift yields. Central-bank accumulation provides a long-term bid, but daily moves track whether ${fp(snapshot, snapshot.resistance1)} holds as dynamic resistance.`,
    "silver-xagusd": `${headlineNote}Silver at ${fp(snapshot, snapshot.price)} combines **precious-metal flows** with **industrial demand** (solar, electronics). XAG often amplifies gold moves with higher beta — watch whether gold's direction and the gold-silver ratio confirm today's ${sessionDirection(snapshot.changePct)} silver tape.`,
    "brent-crude": `${headlineNote}Brent at ${fp(snapshot, snapshot.price)} reflects **OPEC+ supply guidance**, **Middle East supply risk**, and **EIA inventory surprises**. Oil moves feed back into inflation expectations and Fed pricing, which in turn affects USD, yields, and risk assets. ${fp(snapshot, snapshot.resistance1)} is the near-term ceiling until inventory data shifts the narrative.`,
    sp500: `${headlineNote}The S&P 500 at ${fp(snapshot, snapshot.price)} is anchored by **mega-cap tech earnings** while **rates, oil, and credit spreads** cap broader multiples. Cap-weighted strength can mask weak breadth — today's ${snapshot.changePct >= 0 ? "gain" : "loss"} of ${Math.abs(snapshot.changePct).toFixed(2)}% should be read alongside whether cyclicals participate or only megacaps lead.`,
    "nasdaq-100": `${headlineNote}The Nasdaq 100 at ${fp(snapshot, snapshot.price)} is **more rate-sensitive** than the broad S&P due to long-duration growth weighting. AI capex narratives and megacap guidance support the index, but rising yields compress multiples quickly — ${fp(snapshot, snapshot.support1)} is the first support test if rates spike.`,
  };

  return drivers[id];
}

function buildFaq(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot
): { question: string; answer: string }[] {
  const price = fp(snapshot, snapshot.price);
  const res1 = fp(snapshot, snapshot.resistance1);
  const sup1 = fp(snapshot, snapshot.support1);

  const faqs: Record<DailyInstrumentId, { question: string; answer: string }[]> =
    {
      bitcoin: [
        {
          question: "Is Bitcoin bullish or bearish today?",
          answer: `${sessionDirection(snapshot.changePct) === "firm" ? "Constructive" : sessionDirection(snapshot.changePct) === "soft" ? "Soft" : "Neutral"} — BTC at ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%) with support at ${sup1} and resistance at ${res1}.`,
        },
        {
          question: "What is the next resistance for BTC?",
          answer: `${res1} is the nearest resistance, then ${fp(snapshot, snapshot.resistance2)} on extension.`,
        },
        {
          question: "What moves Bitcoin fastest today?",
          answer: "US Treasury yield shifts, spot BTC ETF flow data, and USD direction — crypto-native headlines are secondary unless they change regulatory or liquidity conditions.",
        },
      ],
      ethereum: [
        {
          question: "Does ETH follow Bitcoin today?",
          answer: `ETH at ${price} is trading with ${snapshot.changePct >= 0 ? "positive" : "negative"} session momentum (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%), typically tracking BTC beta unless L2 or staking headlines create divergence.`,
        },
        {
          question: "What is the next ETH resistance?",
          answer: `${res1}, then ${fp(snapshot, snapshot.resistance2)} if risk appetite improves.`,
        },
        {
          question: "What is the key ETH support?",
          answer: `${sup1} — a daily close below opens ${fp(snapshot, snapshot.support2)}.`,
        },
      ],
      "eur-usd": [
        {
          question: "What level matters most for EUR/USD today?",
          answer: `Pivot ${price}; resistance ${res1}, support ${sup1}.`,
        },
        {
          question: "Why is EUR/USD range-bound?",
          answer: "Balanced ECB–Fed expectations and low realized volatility keep the pair anchored until US or eurozone data surprises arrive.",
        },
        {
          question: "What breaks EUR/USD out of range?",
          answer: "A decisive US inflation surprise or major ECB policy shift that reprices front-end yields.",
        },
      ],
      "gbp-usd": [
        {
          question: "What is cable's near-term range?",
          answer: `Support ${sup1}, resistance ${res1}, pivot ${price}.`,
        },
        {
          question: "What moves GBP/USD fastest?",
          answer: "UK inflation surprises, BoE communication, and broad USD safe-haven flows.",
        },
        {
          question: "Is cable trending today?",
          answer: `The daily structure is in a ${snapshot.trend} with ${describeTrend(snapshot).replace(/\*\*/g, "")}.`,
        },
      ],
      "usd-jpy": [
        {
          question: "When does intervention risk rise for USD/JPY?",
          answer: `When the pair approaches ${fp(snapshot, snapshot.resistance2)} with rapid, disorderly yen weakness and official rhetoric intensifies.`,
        },
        {
          question: "What is USD/JPY's lead indicator?",
          answer: "The US–Japan 2-year yield spread — divergence between USD/JPY and yields often resolves toward the rate move.",
        },
        {
          question: "What is today's USD/JPY pivot?",
          answer: `${price} — loss of ${sup1} signals short-term yen recovery.`,
        },
      ],
      "aud-usd": [
        {
          question: "Why is AUD called a risk proxy?",
          answer: "Commodity exports and carry appeal tie AUD to global growth sentiment and APAC equity tone.",
        },
        {
          question: "What are today's AUD/USD levels?",
          answer: `Resistance ${res1}, support ${sup1}, spot ${price}.`,
        },
        {
          question: "What hurts the aussie most?",
          answer: "USD strength combined with China growth fears or broad risk-off flows.",
        },
      ],
      "gold-xauusd": [
        {
          question: "Why isn't gold rallying on headlines alone?",
          answer: "When shocks lift yields and USD, the opportunity cost of holding non-yielding bullion often outweighs short-lived haven demand.",
        },
        {
          question: "What confirms a gold uptrend?",
          answer: `A sustained break above ${res1} on falling real yields and USD softness.`,
        },
        {
          question: "What is gold's key support today?",
          answer: `${sup1}, then ${fp(snapshot, snapshot.support2)} on extension lower.`,
        },
      ],
      "silver-xagusd": [
        {
          question: "Why is silver more volatile than gold?",
          answer: "Smaller market depth and a larger industrial demand component amplify moves in both directions.",
        },
        {
          question: "What are today's silver levels?",
          answer: `Spot ${price}, resistance ${res1}, support ${sup1}.`,
        },
        {
          question: "Does silver follow gold?",
          answer: "Directionally yes, but with higher beta — industrial demand can create short-term divergence.",
        },
      ],
      "brent-crude": [
        {
          question: "Why does oil affect inflation expectations?",
          answer: "Energy pass-through influences CPI forecasts and Fed hike pricing, which feeds back into USD and risk assets.",
        },
        {
          question: "What are today's Brent levels?",
          answer: `${price} with resistance ${res1} and support ${sup1}.`,
        },
        {
          question: "What catalyst matters most for oil?",
          answer: "EIA inventory surprises and OPEC+ supply guidance, plus geopolitical supply disruption headlines.",
        },
      ],
      sp500: [
        {
          question: "Why is the index holding despite macro risk?",
          answer: "Cap-weighted mega-cap tech earnings often cushion index-level drawdowns even when breadth is weak.",
        },
        {
          question: "What would break S&P support quickly?",
          answer: `A sustained close below ${sup1}, especially if accompanied by credit spread widening or a rates spike.`,
        },
        {
          question: "What is today's S&P pivot?",
          answer: `${price} — ${res1} is the nearest resistance.`,
        },
      ],
      "nasdaq-100": [
        {
          question: "Why is Nasdaq more rate-sensitive?",
          answer: "Long-duration growth stocks discount future earnings more aggressively when yields rise.",
        },
        {
          question: "What are today's Nasdaq levels?",
          answer: `Spot ${price}, support ${sup1}, resistance ${res1}.`,
        },
        {
          question: "What supports the Nasdaq tape?",
          answer: "Mega-cap AI capex narratives and earnings beats — but yields cap multiples if inflation surprises hawkishly.",
        },
      ],
    };

  return faqs[id];
}

function buildContent(
  snapshot: MarketSnapshot,
  dateLabel: string,
  headline?: string
): string {
  const id = snapshot.instrumentId;
  const price = fp(snapshot, snapshot.price);
  const hi = fp(snapshot, snapshot.sessionHigh);
  const lo = fp(snapshot, snapshot.sessionLow);
  const res1 = fp(snapshot, snapshot.resistance1);
  const res2 = fp(snapshot, snapshot.resistance2);
  const sup1 = fp(snapshot, snapshot.support1);
  const sup2 = fp(snapshot, snapshot.support2);
  const dir = sessionDirection(snapshot.changePct);
  const headlineBlock = headline
    ? `Relevant headline: "${headline.slice(0, 120)}${headline.length > 120 ? "…" : ""}".\n\n`
    : "";

  const intro = `${snapshot.label} is trading near **${price}** on ${dateLabel}, ${snapshot.changePct >= 0 ? "up" : "down"} roughly **${Math.abs(snapshot.changePct).toFixed(2)}%** from the prior close (${snapshot.dataSource}). This ${TITLES[id].split(":")[0].toLowerCase()} connects live price structure to instrument-specific drivers — covering today's session range, computed technical levels, indicator readings from recent daily bars, and balanced scenarios without trade signals.`;

  const priceAction = `${headlineBlock}**Spot reference:** ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}% vs prior close)
**Session range:** ${lo} – ${hi}

${snapshot.label} is trading **${dir}** on the session. Over the last ${Math.min(snapshot.bars.length, 10)} daily bars, price has been ${describeTrend(snapshot)}. The move ${snapshot.changePct >= 0 ? "extended toward" : "retreated from"} **${snapshot.changePct >= 0 ? res1 : sup1}**, with **${lo}** marking the recent session low and **${hi}** the session high.

Chart context from ${snapshot.dataSource}: the ${snapshot.trend} structure between **${fp(snapshot, snapshot.swingLow)}** (swing low) and **${fp(snapshot, snapshot.swingHigh)}** (swing high) defines the active trade zone. ${snapshot.changePct >= 0 ? "Buyers defended dips above recent lows" : "Sellers emerged below recent highs"}, keeping the focus on whether **${price}** holds as the session pivot.`;

  const technical = `On the daily chart, ${snapshot.label} is in a **${snapshot.trend}** with nearest resistance at **${res1}** and support at **${sup1}**.

${describeRsi(snapshot.rsi14)}

${describeMovingAverages(snapshot)}

A daily close above **${res1}** would signal bulls regained near-term control toward **${res2}**. Loss of **${sup1}** on a closing basis opens a move toward **${sup2}** — especially if cross-asset flows (USD, yields, or related markets) confirm the breakdown.`;

  const keyLevels = [
    `**Resistance:** ${res1}, then ${res2}`,
    `**Support:** ${sup1}, then ${sup2}`,
    `**Pivot:** ${price}`,
  ];

  const chartPlaceholder = `[CHART: ${snapshot.label} daily — resistance ${res1}, support ${sup1}]`;

  const indicatorSignals = `**RSI (14, daily):** ${snapshot.rsi14 !== null ? snapshot.rsi14.toFixed(1) : "N/A"} — ${snapshot.rsi14 !== null ? (snapshot.rsi14 >= 55 ? "constructive momentum" : snapshot.rsi14 <= 45 ? "soft momentum" : "neutral range momentum") : "computed from available bars"}.

**20-day / 50-day moving averages:** ${snapshot.sma20 !== null ? `20-DMA ${fp(snapshot, snapshot.sma20)}` : "20-DMA N/A"}${snapshot.sma50 !== null ? `; 50-DMA ${fp(snapshot, snapshot.sma50)}` : "; 50-DMA N/A"}.

**Session momentum:** ${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}% — ${dir} tone ${snapshot.trend === "range" ? "inside the established range" : `within a ${snapshot.trend}`}.`;

  const fundamentals = buildFundamentals(id, snapshot, headline);

  const bullish = `A break above **${res1}** with supportive cross-asset flows targets **${res2}** — confirmation requires ${id.includes("usd") || id.includes("jpy") ? "USD direction aligning with the move" : id.includes("gold") || id.includes("silver") ? "falling real yields or USD softness" : id.includes("brent") ? "supply risk escalation or inventory draw" : id.includes("bitcoin") || id.includes("ethereum") ? "improving risk appetite and stable yields" : "improving breadth and stable yields"}.`;

  const bearish = `Failure at **${sup1}** opens **${sup2}** — particularly if ${id === "usd-jpy" ? "intervention rhetoric or risk-off JPY covering accelerates" : id.includes("gold") || id.includes("silver") ? "real yields and USD rise together" : id.includes("brent") ? "demand fears or USD strength cap crude" : "macro de-risking lifts USD and compresses risk assets"}.`;

  const baseCase = `${snapshot.label} holds **${sup1}–${res1}** while ${snapshot.trend === "range" ? "range trade dominates" : `the ${snapshot.trend} matures`} — **${price}** remains the session pivot until the next scheduled macro catalyst shifts cross-asset flows.`;

  const faq = buildFaq(id, snapshot);
  const faqBlock = faq
    .map((item) => `**${item.question}** ${item.answer}`)
    .join("\n\n");

  const disclaimer =
    id.includes("bitcoin") || id.includes("ethereum")
      ? "*Not financial advice. Crypto is highly volatile. This auto-generated forecast uses live market data for educational purposes only.*"
      : id.includes("sp500") || id.includes("nasdaq")
        ? "*For informational purposes only. Index trading involves substantial risk. Auto-generated from live market data — not financial advice.*"
        : "*Educational forecast only — not a recommendation to trade forex, CFDs, or commodities. Auto-generated from live market data.*";

  return `${intro}

## Price Action Overview

${priceAction}

## Technical Analysis

${technical}

### Key Support and Resistance Levels

${keyLevels.map((l) => `- ${l}`).join("\n")}

${chartPlaceholder}

### Indicator Signals

${indicatorSignals}

## Fundamental Analysis

${fundamentals}

## Forecast / Outlook

**Bullish scenario:** ${bullish}

**Bearish scenario:** ${bearish}

**Base case:** ${baseCase}

## FAQ

${faqBlock}

${disclaimer}`;
}

export function buildForecastFromSnapshot(
  snapshot: MarketSnapshot,
  now: string,
  headline?: string
): Article {
  const id = snapshot.instrumentId;
  const dateLabel = now.slice(0, 10);
  const cat = CATEGORY[id];
  const price = fp(snapshot, snapshot.price);

  return {
    slug: `${SLUG_PREFIX[id]}-auto-${dateLabel}`,
    title: TITLES[id],
    excerpt: `${snapshot.label} forecast for ${dateLabel}: ${snapshot.label} near ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%), ${snapshot.trend} structure, and key support/resistance from live data.`,
    content: buildContent(snapshot, dateLabel, headline),
    category: cat,
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES[cat === "commodities" ? "commodities" : cat] ?? IMAGES.forex,
    isOriginal: true,
  };
}

export function buildMinimalFallbackArticle(
  id: DailyInstrumentId,
  label: string,
  now: string,
  headline?: string,
  category: ArticleCategory = "forex"
): Article {
  const dateLabel = now.slice(0, 10);
  const headlineNote = headline
    ? `Headline context: "${headline.slice(0, 100)}".`
    : "Live price data was unavailable at generation time.";

  return {
    slug: `${SLUG_PREFIX[id]}-auto-${dateLabel}`,
    title: TITLES[id] ?? `${label} Forecast Today: Analysis & Key Levels`,
    excerpt: `${label} forecast for ${dateLabel}: session outlook pending live data refresh.`,
    content: `${label} is in focus on ${dateLabel}. ${headlineNote}

## Price Action Overview

Live chart data was unavailable when this forecast was generated. Check back after the next data sync for computed levels and indicator readings.

## Technical Analysis

Monitor prior session highs/lows and the 20-day moving average for near-term structure once live data is restored.

## Forecast / Outlook

**Base case:** Range trade until live data and the next scheduled catalyst provide clearer direction.

*Educational forecast only — not financial advice. Generated without live price data.*`,
    category,
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES[category] ?? IMAGES.forex,
    isOriginal: true,
  };
}
