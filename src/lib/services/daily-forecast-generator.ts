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

function dateSlug(prefix: string, isoDate?: string): string {
  const date = isoDate ?? new Date().toISOString().slice(0, 10);
  return `${prefix}-auto-${date}`;
}

export type GenerateDailyForecastsOptions = {
  /** Publish as a specific UTC calendar day (YYYY-MM-DD). */
  asOfDate?: string;
};

export function stampForecastsForDate(
  forecasts: Article[],
  isoDate: string
): Article[] {
  const publishedAt = `${isoDate}T06:00:00.000Z`;

  return forecasts.map((forecast) => ({
    ...forecast,
    publishedAt,
    slug: forecast.slug.replace(/-auto-\d{4}-\d{2}-\d{2}$/, `-auto-${isoDate}`),
  }));
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

/** Shared prose blocks to reach ~1,000 words per auto-generated article. */
function expandPriceAction(base: string): string {
  return `${base}

Liquidity often thins between the Asia close and the London open, which can amplify headline-driven spikes without changing the daily trend. When macro uncertainty is elevated, many participants reduce exposure ahead of the next US data cluster rather than carry full risk through the event — a pattern that frequently produces range compression in the 12–24 hours before CPI, NFP, or Fed testimony, followed by directional expansion once the print clears.

Volume confirmation matters: a move beyond the stated session high or low on rising participation tends to attract follow-through from systematic models; a fade back into the prior range on light volume often signals headline noise rather than a regime change.`;
}

function expandTechnical(base: string, instrument: string): string {
  return `${base}

Multi-timeframe alignment is the practical filter most desk traders apply next. On the 4-hour chart, watch whether the latest swing low from the Asia session holds on the first European push — failure there often triggers stop-loss cascades toward the next listed support. On the daily chart, the relationship between spot price, the 20-day moving average, and the 50-day moving average defines whether dips are bought aggressively or only selectively.

Pattern recognition centers on whether ${instrument} is making **higher lows with flat highs** (accumulation), **lower highs with flat lows** (distribution), or **symmetrical compression** (breakout pending). The answer determines whether mean-reversion or breakout strategies dominate until the next macro surprise clears.`;
}

function expandFundamentals(base: string, upcomingEvent: string): string {
  return `${base}

Positioning into **${upcomingEvent}** typically bifurcates: macro funds lean on rates and FX hedges, while discretionary traders reduce gross exposure and widen stop buffers. Consensus expectations are already partially embedded in front-end Treasury yields and the US dollar index — the **surprise component** of the release matters more than the absolute level printed.

Secondary drivers include energy pass-through (oil to CPI expectations), geopolitical headline risk (safe-haven USD demand), and any same-day Fed communication that could override the inflation signal. Cross-asset volatility often peaks in the 30 minutes after the data drop rather than at the open, which is why intraday ranges can look quiet even when the weekly narrative is tense.`;
}

function buildIndicatorSignals(
  primary: string,
  secondary: string,
  tertiary: string
): string {
  return `**${primary}**

**${secondary}**

**${tertiary}**

**Volume and volatility context** — ATR on the daily timeframe is a useful sanity check when RSI sits away from extremes: compressed ATR into a major event often precedes an expansion candle; elevated ATR without a clear breakdown suggests two-way trade rather than trend continuation. Correlation with related markets (USD, yields, oil, peer instruments) should confirm whether the signal is idiosyncratic or macro-led before sizing risk.`;
}

function expandOutlook(baseCase: string): string {
  return `${baseCase} Traders often treat the first hour after the next US macro release as the true test of whether the base-case range survives — a hold above pivot on soft data, or a breakdown through support on a hot print, tends to set the tone for the rest of the week.`;
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
    slug: dateSlug("bitcoin"),
    title: `Bitcoin Forecast Today: BTC Price Analysis & Key Levels`,
    excerpt: `Bitcoin price forecast for ${dateLabel}: BTC ${dir} at $${formatUsd(btc.current_price, 0)}, ETF flows, yield sensitivity, and support/resistance levels.`,
    content: buildForecastContent({
      intro: `Bitcoin is trading near **$${formatUsd(btc.current_price, 0)}** on ${dateLabel}, ${ch >= 0 ? "up" : "down"} roughly **${Math.abs(ch).toFixed(2)}%** over the past 24 hours. In this bitcoin price forecast today, we connect spot action to macro drivers — especially front-end Treasury yields, spot ETF flow data, and the upcoming US inflation calendar — rather than treating BTC as a simple risk-on proxy. You will learn today's range context, the technical levels framing the next move, indicator readings that confirm or contradict the tape, and balanced bullish versus bearish scenarios without a buy-or-sell directive.`,
      priceAction: expandPriceAction(`${macroNote}

**Spot reference:** $${formatUsd(btc.current_price, 0)} (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% over 24h)
**24h range:** $${formatUsd(btc.low_24h, 0)} – $${formatUsd(btc.high_24h, 0)}

Session tone is ${dir} as crypto tracks macro liquidity and rate expectations more closely than geopolitical headlines alone. BTC has traded inside a multi-week **$60,000–$65,000** consolidation band, with repeated failures above the upper boundary suggesting supply from profit-taking and macro hedges rather than a clean trending market.`),
      technical: expandTechnical(`On the daily chart, BTC is oscillating inside a **$${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)}** band defined by recent swing structure. The sequence since the last push toward range highs reflects **range-bound trade with lower-high risk** unless ETF inflows accelerate alongside softer US rate pricing. Intraday, **$${formatUsd(btc.low_24h, 0)}** is the first support test; a daily close below it would open a faster move toward **$${formatUsd(Math.round(bandLow * 0.97), 0)}**.`, "Bitcoin"),
      keyLevels: [
        `**Resistance:** $${formatUsd(bandHigh, 0)}, then $${formatUsd(Math.round(bandHigh * 1.04), 0)} on extension`,
        `**Support:** $${formatUsd(bandLow, 0)}, then $${formatUsd(Math.round(bandLow * 0.97), 0)} if macro turns defensive`,
        `**Pivot:** $${formatUsd(btc.current_price, 0)} — acceptance above favors range highs; failure reopens mid-band trade`,
      ],
      chartPlaceholder: `[CHART: BTC/USD daily showing $${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)} consolidation]`,
      indicatorSignals: buildIndicatorSignals(
        `RSI (14, daily, estimated 45–52) — neutral-to-soft momentum inside the range; not oversold enough to guarantee an immediate bounce without a USD or yields catalyst reversal.`,
        `50-day moving average — the key trend divider: holds above it keep the broader recovery narrative intact; breaks below invite faster de-risking toward the **$${formatUsd(bandLow, 0)}** floor.`,
        `24h momentum (${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%) — ${dir} but controlled; consistent with a pullback inside a band rather than a breakdown cascade.`
      ),
      fundamentals: expandFundamentals(
        "ETF net flows and US 2-year yield direction remain BTC's dominant macro inputs. When markets price Fed hikes, non-yielding assets face headwinds; when data softens, BTC often reclaims beta leadership within crypto. Regulatory headlines and weekend liquidity gaps remain secondary volatility amplifiers. Spot Bitcoin ETF daily flow prints have become the clearest real-time demand gauge — sustained inflows can cushion CPI-week drawdowns, while renewed outflows tend to accelerate moves toward range lows.",
        "the next US CPI release"
      ),
      bullish: `Risk-on rotation or softer rate pricing pushes BTC toward **$${formatUsd(Math.round(bandHigh * 1.04), 0)}** with sustained ETF inflows as confirmation — especially if the dollar eases and front-end yields dip in the 30 minutes after the data.`,
      bearish: `A break below **$${formatUsd(Math.round(bandLow * 0.97), 0)}** opens a quick move to prior support as macro de-risking accelerates, particularly on a hot core CPI print that revives hike odds.`,
      baseCase: expandOutlook(
        `BTC holds **$${formatUsd(bandLow, 0)}–$${formatUsd(bandHigh, 0)}** as ETF flows and front-end yields set the tone through the next US data cycle.`
      ),
      faq: [
        {
          question: "Why is BTC tracking yields more than headlines?",
          answer:
            "Markets are treating geopolitical shocks as inflation events that can pull forward Fed hikes, which pressures non-yielding assets even when risk headlines flash red.",
        },
        {
          question: "What confirms a bullish breakout?",
          answer:
            "Spot ETF inflows accelerating alongside a daily close above range resistance and softer US rate expectations.",
        },
        {
          question: "What is the biggest risk to Bitcoin this week?",
          answer:
            "A hotter-than-expected core CPI print that lifts USD and 2-year yields, breaking the $60,000–$65,000 range lower.",
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
    slug: dateSlug("eur-usd"),
    title: "EUR/USD Forecast Today: Euro Dollar Analysis & Key Levels",
    excerpt: `EUR/USD forecast for ${dateLabel}: euro dollar near ${eurusd.toFixed(4)}, ECB reference data, Fed pricing, and support/resistance levels for cable traders.`,
    content: buildForecastContent({
      intro: `EUR/USD is trading near **${eurusd.toFixed(4)}** on ${dateLabel}, derived from the latest ECB reference fix (${rates.date}). This EUR/USD forecast today explains the session context, technical range, indicator backdrop, and macro catalysts — primarily Fed versus ECB policy divergence and US inflation risk — that could decide whether the euro can recover or the dollar extends its bid. You will learn where the pair sits within its recent band, which levels matter on the daily chart, and what conditional scenarios could unfold into the next major US data release.`,
      priceAction: expandPriceAction(`${macroNote}

**Reference rate (ECB):** 1 EUR = ${rates.rates.EUR.toFixed(4)} USD → EUR/USD ≈ **${eurusd.toFixed(4)}**

The pair is sensitive to US data surprises and energy-driven inflation repricing. Unless a clear catalyst hits, EUR/USD tends to mean-revert inside a tight band around fair value — but a broad USD safe-haven bid can push the cross toward the lower edge of its July range even when eurozone data is stable.`),
      technical: expandTechnical(`Daily structure shows EUR/USD consolidating near **${eurusd.toFixed(4)}** with low realized volatility. Repeated failures above **${resUp}** suggest supply on euro rallies, while dips toward **${resDn}** have attracted modest buying in recent sessions. The 20-day moving average is the near-term pivot — repeated failures there often precede range breaks toward monthly highs or lows.`, "EUR/USD"),
      keyLevels: [
        `**Resistance:** ${resUp} (near-term), then ${(eurusd * 1.02).toFixed(4)} on USD softness`,
        `**Support:** ${resDn} (near-term), then ${(eurusd * 0.98).toFixed(4)} on safe-haven USD bid`,
        `**Pivot:** ${eurusd.toFixed(4)} — mid-band equilibrium`,
      ],
      chartPlaceholder: `[CHART: EUR/USD daily around ${eurusd.toFixed(4)} pivot]`,
      indicatorSignals: buildIndicatorSignals(
        `RSI (daily, estimated mid-40s to high-40s) — neutral-to-soft momentum in a range market; not oversold enough to guarantee an immediate bounce without a USD catalyst reversal.`,
        `20-day moving average — flat-to-slightly-negative when spot hugs the lower half of the range; a daily close back above **${resUp}** would be required to restore a constructive euro tone.`,
        `Range equilibrium — mean-reversion inside a ~1% band has dominated short-term trade until CPI or central-bank surprises break the stalemate.`
      ),
      fundamentals: expandFundamentals(
        "ECB communication remains cautious while markets price a higher-for-longer Fed on oil-linked inflation fears. Eurozone growth data and US CPI are the dominant catalysts. Geopolitical risk typically lifts USD first, capping EUR rallies even when European data is stable. EUR/USD is often traded as the inverse of a **rates + geopolitical USD** bundle rather than on idiosyncratic euro weakness alone.",
        "US CPI"
      ),
      bullish: `Dollar softness on soft US inflation data targets **${resUp}** and potentially **${(eurusd * 1.02).toFixed(4)}**, especially if Fed speakers lean dovish the same session.`,
      bearish: `USD safe-haven bid on geopolitical escalation or hot core CPI risks **${resDn}** and a break toward **${(eurusd * 0.98).toFixed(4)}**.`,
      baseCase: expandOutlook(
        `EUR/USD oscillates in a **1% band around ${eurusd.toFixed(4)}** unless US data shifts Fed pricing materially.`
      ),
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
        {
          question: "What breaks EUR/USD out of range?",
          answer:
            "A decisive US core CPI surprise or a major shift in Fed hike pricing that moves front-end Treasury yields sharply.",
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
    slug: dateSlug("usd-jpy"),
    title: "USD/JPY Forecast Today: Yen Analysis & Key Levels",
    excerpt: `USD/JPY forecast for ${dateLabel}: dollar-yen near ${usdjpy.toFixed(2)}, yield spread focus, intervention watch zone, and technical levels.`,
    content: buildForecastContent({
      intro: `USD/JPY is trading near **${usdjpy.toFixed(2)}** on ${dateLabel}, reflecting the ongoing tug-of-war between US–Japan yield divergence and periodic intervention rhetoric. This USD/JPY forecast today covers session drivers, technical structure, indicator context, and the levels traders watch when the yen approaches historically sensitive territory — without issuing trade signals.`,
      priceAction: expandPriceAction(`${macroNote}

**Derived cross:** USD/JPY ≈ **${usdjpy.toFixed(2)}** (via ECB ${rates.date})

Carry dynamics and the rate spread continue to favor gradual yen weakness, but verbal intervention risk rises as the pair approaches multi-year extremes. USD/JPY often lifts in tandem with front-end Treasury yields when the dollar bid is broad-based across G10.`),
      technical: expandTechnical(`USD/JPY is grinding inside a **${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)}** band unless the US–Japan yield gap widens sharply. Higher lows above **${(usdjpy * 0.985).toFixed(2)}** define the constructive trend; loss of **${(usdjpy * 0.995).toFixed(2)}** on a closing basis would signal short-term yen recovery.`, "USD/JPY"),
      keyLevels: [
        `**Resistance:** ${(usdjpy * 1.005).toFixed(2)}, then ${(usdjpy * 1.015).toFixed(2)} (intervention watch)`,
        `**Support:** ${(usdjpy * 0.995).toFixed(2)}, then ${(usdjpy * 0.985).toFixed(2)} on risk-off yen bid`,
        `**Pivot:** ${usdjpy.toFixed(2)}`,
      ],
      chartPlaceholder: `[CHART: USD/JPY daily near ${usdjpy.toFixed(2)} with yield-spread overlay]`,
      indicatorSignals: buildIndicatorSignals(
        `RSI (daily, estimated 55–62) — constructive USD momentum without extreme overbought readings typical of disorderly yen weakness.`,
        `50-day moving average (rising, estimated near ${(usdjpy * 0.99).toFixed(2)}) — trend support; loss of this line would signal yen short-covering.`,
        `Yield-spread sensitivity — USD/JPY's lead indicator remains the US 2-year Treasury yield; watch for divergence if CPI surprises dovishly.`
      ),
      fundamentals: expandFundamentals(
        "Higher US yields on inflation fears widen the policy gap versus a cautious Bank of Japan. Gulf geopolitical risk has favored dollar liquidity over yen safe-haven flows in recent sessions. MoF/BoJ comments remain the key policy wildcard near intervention-sensitive levels. Oil-driven inflation pass-through can reinforce the higher-for-longer USD narrative even when Asian risk headlines flash red.",
        "US CPI"
      ),
      bullish: `Higher US yields push toward **${(usdjpy * 1.015).toFixed(2)}** — watch intervention rhetoric near historically sensitive zones above **${(usdjpy * 1.02).toFixed(2)}**.`,
      bearish: `Risk-off yen bid pulls toward **${(usdjpy * 0.985).toFixed(2)}** on de-escalation, soft US data, or verbal intervention.`,
      baseCase: expandOutlook(
        `Pair grinds **${(usdjpy * 0.995).toFixed(2)}–${(usdjpy * 1.005).toFixed(2)}** unless the yield spread moves decisively.`
      ),
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
        {
          question: "Why isn't the yen benefiting from risk headlines?",
          answer:
            "When shocks lift oil and US hike odds, the dollar often outperforms the yen as a funding and liquidity currency.",
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
    slug: dateSlug("gold-xauusd"),
    title: price
      ? `XAUUSD Forecast Today: Gold Price Analysis & Key Levels`
      : `XAUUSD Forecast Today: Gold Price Analysis & Key Levels`,
    excerpt: price
      ? `Gold price forecast for ${dateLabel}: XAU/USD near $${formatUsd(price, 0)}, real yields vs haven demand, and support/resistance levels.`
      : `Gold price forecast for ${dateLabel}: XAU/USD outlook as real yields, USD strength, and geopolitical risk shape direction.`,
    content: buildForecastContent({
      intro: price
        ? `Gold is trading near **$${formatUsd(price, 0)}/oz** on ${dateLabel}, balancing safe-haven demand against firm real yields and a strong US dollar. This gold price forecast today maps the session setup, technical levels, indicator readings, and macro catalysts that decide whether XAU/USD can reclaim upside or extend its consolidation — with conditional scenarios only, not trade signals.`
        : `Gold is consolidating on ${dateLabel} as markets weigh geopolitical risk against higher real yields and dollar strength. This gold price forecast today explains the cross-asset drivers, technical structure, indicator context, and scenarios traders use to frame XAU/USD into the next US data releases.`,
      priceAction: expandPriceAction(`${macroNote}

${priceLine}

Gold's correlation with real yields and the dollar remains the dominant daily driver — war headlines alone have not been enough to override rate gravity in recent sessions when shocks are priced as inflation events.`),
      technical: expandTechnical(
        price
          ? `XAU/USD is holding a **$${low}–$${high}** range on the daily chart. The sequence since recent swing highs reflects **distribution after a multi-month advance** rather than a fresh impulse higher. The 50-day MA is the bull/bear line — reclaiming it on volume would signal macro regime stabilization; failure keeps rallies sold into resistance.`
          : `XAU/USD is range-bound as MACD flattens on the daily timeframe. The 50-day moving average defines whether dips are bought or sold aggressively — the key filter for near-term trend health.`,
        "gold (XAU/USD)"
      ),
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
      indicatorSignals: buildIndicatorSignals(
        price
          ? `RSI (14, daily, estimated 38–48) — bearish-to-neutral momentum; not deeply oversold, fitting a grind lower rather than capitulation.`
          : `RSI (14, daily) — neutral-to-soft near 45–55, consistent with two-sided trade inside a range.`,
        price
          ? `50-day MA vs 200-day MA — price below both with averages rolling over implies rallies encounter dynamic supply until CPI or Fed rhetoric shifts the rates narrative.`
          : `Moving averages — spot relative to the 50-day MA defines whether dips are bought or sold aggressively.`,
        `Real-yield correlation — gold's daily beta to US real yields and DXY remains the lead cross-asset tell; haven headlines without yield relief often produce sell-the-rally behavior.`
      ),
      fundamentals: expandFundamentals(
        "Central bank accumulation provides a long-term bid, but daily moves track US yields and DXY. Oil-driven inflation fears can hurt gold when markets price Fed hikes. Geopolitical spikes may produce brief rallies, but sellers often emerge unless real yields reverse lower. The next US inflation print is the binary that can reset whether gold trades as an inflation hedge or a victim of higher opportunity cost.",
        "US CPI"
      ),
      bullish: price
        ? `Escalation or softer USD drives a test of **$${bullTarget}**, especially if core CPI undershoots and real yields dip.`
        : `Escalation or softer USD reignites safe-haven flows toward prior highs if yields cooperate.`,
      bearish: price
        ? `Hawkish Fed repricing or USD squeeze risks **$${bearTarget}**, particularly on a hot core CPI print.`
        : `Hawkish Fed repricing or USD squeeze caps upside near recent resistance.`,
      baseCase: expandOutlook(
        price
          ? `Gold holds **$${low}–$${high}** as markets balance inflation hedging vs higher-for-longer rates.`
          : `Gold trades defensively in range as geopolitical headlines compete with firm US yields.`
      ),
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
        {
          question: "What is the biggest headwind for gold this week?",
          answer:
            "Hot US CPI that lifts hike odds, USD, and real yields simultaneously.",
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
    slug: dateSlug("sp500"),
    title: "S&P 500 Forecast Today: Index Analysis & Key Levels",
    excerpt: `S&P 500 forecast for ${dateLabel}: index near ${price.toFixed(2)}, mega-cap tech cushion vs macro headwinds, and key support/resistance levels.`,
    content: buildForecastContent({
      intro: `The S&P 500 is trading near **${price.toFixed(2)}** on ${dateLabel}, ${ch >= 0 ? "up" : "down"} about **${Math.abs(ch).toFixed(2)}%** on the session. This S&P 500 forecast today examines whether mega-cap earnings can continue to anchor the index while rates, oil, and geopolitical risk pressure broader market breadth — covering technical levels, indicator context, and conditional scenarios without issuing trade signals.`,
      priceAction: expandPriceAction(`${macroNote}

**Reference:** ${price.toFixed(2)} (day ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%)
${spy ? `**Day range:** $${spy.l.toFixed(2)} – $${spy.h.toFixed(2)}` : ""}

Index-level moves remain narrow — mega-cap tech absorbs macro shocks better than cyclicals and small caps, a late-cycle signature that defines the current tape. Breadth weakness beneath cap-weighted strength limits confidence in sustained rallies even when the headline index holds near highs.`),
      technical: expandTechnical(`The S&P 500 is consolidating near **${price.toFixed(0)}** with the 50-day moving average as near-term support. Higher lows from recent session lows define an ascending support line; failure to hold **${(price * 0.97).toFixed(2)}** on a closing basis would signal the macro-week dip is more than intraday noise.`, "the S&P 500"),
      keyLevels: [
        `**Resistance:** ${(price * 1.02).toFixed(2)}, then prior all-time high zone`,
        `**Support:** ${(price * 0.97).toFixed(2)}, then 200-day moving average area`,
        `**Pivot:** ${price.toFixed(2)}`,
      ],
      chartPlaceholder: `[CHART: S&P 500 daily near ${price.toFixed(0)} with breadth overlay]`,
      indicatorSignals: buildIndicatorSignals(
        `RSI (daily, estimated 50–58) — constructive but not euphoric; watch for bearish divergence if CPI spikes yields while the index stalls under resistance.`,
        `MACD (daily) — positive but flattening momentum, consistent with late-stage trend rather than fresh breakout energy.`,
        `Breadth context — cap-weighted mega-cap strength can mask weak participation in cyclicals; advancing/declining issues should confirm any breakout above resistance.`
      ),
      fundamentals: expandFundamentals(
        "Mega-cap AI earnings provide an index floor, but higher oil and Fed hike pricing compress valuations. Credit spreads and VIX term structure remain the risk-off tell if macro deteriorates. Breadth weakness beneath the surface limits confidence in sustained rallies. Bank earnings and Fed communication the same week as CPI create a stacked catalyst calendar that can override Friday's calm close.",
        "US CPI"
      ),
      bullish: `Soft inflation data reignites risk appetite toward **${(price * 1.02).toFixed(2)}** with broadening earnings participation and stable yields.`,
      bearish: `Rate scare or geopolitical escalation breaks **${(price * 0.97).toFixed(2)}** support as the mega-cap floor fails.`,
      baseCase: expandOutlook(
        `Index consolidates near **${price.toFixed(0)}** with mega-cap tech cushioning macro shocks and 1–2% daily headline swings.`
      ),
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
        {
          question: "What should traders watch besides CPI?",
          answer:
            "Bank earnings guidance, Fed Chair testimony, and whether breadth improves on any post-data rally.",
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
        intro: `Bitcoin is consolidating on ${dateLabel} as traders weigh US yield direction against spot ETF flow data. This bitcoin price forecast today outlines the range structure, macro inputs, indicator context, and balanced scenarios for BTC without issuing trade signals — targeting a full-session read for retail traders planning around the next US data cluster.`,
        priceAction: expandPriceAction(`${macroNote}\n\nBTC traders are watching US yields and ETF flow data for direction. Session volatility remains contained until a macro catalyst arrives, with the **$60,000–$65,000** multi-week band defining the active trade zone.`),
        technical: expandTechnical(
          "Daily RSI near 50 reflects neutral momentum. The 50-day moving average is the primary trend divider — holds above keep recovery intact; breaks below invite faster de-risking toward range lows.",
          "Bitcoin"
        ),
        keyLevels: [
          "**Resistance:** prior range high",
          "**Support:** prior range low and 50-day MA",
          "**Pivot:** mid-range equilibrium",
        ],
        chartPlaceholder: "[CHART: BTC/USD daily consolidation]",
        indicatorSignals: buildIndicatorSignals(
          "RSI (daily, ~50) — neutral momentum; confirmation requires CPI-driven expansion or a hold of range support.",
          "50-day MA — primary trend divider for the recovery narrative.",
          "ETF flow correlation — spot Bitcoin ETF daily flows remain the clearest real-time demand gauge."
        ),
        fundamentals: expandFundamentals(
          "ETF flows and front-end Treasury yields dominate BTC's macro beta. Regulatory headlines remain a secondary volatility source. One day of inflows does not override CPI risk when hike odds are climbing.",
          "the next US CPI release"
        ),
        bullish: "Breakout on risk-on flows and accelerating ETF inflows above range resistance.",
        bearish: "Pullback on USD strength and higher rate expectations through range support.",
        baseCase: expandOutlook(
          "Consolidation near recent pivot until US data resolves direction."
        ),
        faq: [
          {
            question: "What is BTC's lead indicator right now?",
            answer: "US 2-year Treasury yields and spot BTC ETF daily flows.",
          },
          {
            question: "What confirms a bullish breakout?",
            answer: "Sustained ETF inflows plus a daily close above range resistance.",
          },
          {
            question: "What is the biggest risk this week?",
            answer: "Hot core CPI lifting USD and yields, breaking the $60k floor.",
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
        intro: `EUR/USD is range-bound on ${dateLabel} as markets await clearer ECB-Fed policy signals. This EUR/USD forecast today covers the technical range, macro drivers, indicator context, and scenarios for the euro dollar cross — written for retail traders planning around the next US data cluster.`,
        priceAction: expandPriceAction(`${macroNote}\n\nThe pair is trading near fair value with low realized volatility until US or eurozone data surprises arrive. A broad USD safe-haven bid can push EUR toward the lower edge of its range even when European data is stable.`),
        technical: expandTechnical(
          "RSI near 50 and a flat 20-day moving average suggest equilibrium. Range highs and lows from the past two weeks define the active trade zone.",
          "EUR/USD"
        ),
        keyLevels: [
          "**Resistance:** prior monthly high",
          "**Support:** prior monthly low",
          "**Pivot:** 20-day moving average",
        ],
        chartPlaceholder: "[CHART: EUR/USD daily range trade]",
        indicatorSignals: buildIndicatorSignals(
          "RSI (daily, ~48–52) — balanced positioning inside a range market.",
          "20-day MA — near-term pivot; repeated failures often precede range breaks.",
          "Range equilibrium — mean-reversion dominates until CPI or central-bank surprises arrive."
        ),
        fundamentals: expandFundamentals(
          "ECB caution versus Fed hike pricing keeps EUR capped. Geopolitical risk typically supports USD first. EUR/USD is often traded as the inverse of a rates + geopolitical USD bundle.",
          "US CPI"
        ),
        bullish: "Euro gains on soft US data and dovish Fed repricing toward range resistance.",
        bearish: "Dollar bid on safe-haven flows and strong US data through range support.",
        baseCase: expandOutlook(
          "Range trade near fair value through the next macro release."
        ),
        faq: [
          {
            question: "What breaks EUR/USD out of range?",
            answer: "A decisive US inflation surprise or major ECB policy shift.",
          },
          {
            question: "What data matters most this week?",
            answer: "US CPI and any ECB speaker guidance on services inflation.",
          },
          {
            question: "Why does USD often lead on risk headlines?",
            answer: "Geopolitical shocks frequently lift dollar liquidity demand before euro-specific factors matter.",
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
        intro: `Gold is balancing haven demand against real yield headwinds on ${dateLabel}. This gold price forecast today maps XAU/USD technical levels, indicator context, macro scenarios, and conditional outlook paths for the session ahead — written for educational purposes only.`,
        priceAction: expandPriceAction(`${macroNote}\n\nXAU/USD is sensitive to DXY and US real yields more than short-lived geopolitical headlines alone. When shocks are priced as inflation events, rising yields can overpower traditional safe-haven demand.`),
        technical: expandTechnical(
          "Daily RSI near 45–55 shows two-sided trade. The 50-day MA is the bull/bear line for near-term trend health.",
          "gold (XAU/USD)"
        ),
        keyLevels: [
          "**Resistance:** prior swing high",
          "**Support:** prior breakout zone",
          "**Pivot:** mid-range",
        ],
        chartPlaceholder: "[CHART: XAU/USD daily vs real yields]",
        indicatorSignals: buildIndicatorSignals(
          "RSI (daily, 45–55) — neutral-to-soft momentum inside a range.",
          "50-day MA — bull/bear line for near-term trend health.",
          "Real-yield correlation — gold's daily beta to US real yields and DXY remains the lead cross-asset tell."
        ),
        fundamentals: expandFundamentals(
          "Central bank buying supports the long-term floor; daily moves track Fed expectations and USD strength. Geopolitical spikes may produce brief rallies, but sellers often emerge unless real yields reverse lower.",
          "US CPI"
        ),
        bullish: "Geopolitical escalation lifts XAU if yields do not spike in tandem.",
        bearish: "Higher real yields and USD strength cap upside.",
        baseCase: expandOutlook(
          "Gold holds defensive bid inside an established range until CPI clears."
        ),
        faq: [
          {
            question: "Why do yields matter more than headlines for gold?",
            answer:
              "Rising yields raise the opportunity cost of holding non-yielding bullion.",
          },
          {
            question: "What confirms a gold uptrend resumption?",
            answer: "A sustained break above resistance on falling real yields and USD softness.",
          },
          {
            question: "What is the biggest headwind this week?",
            answer: "Hot US CPI lifting hike odds, USD, and real yields simultaneously.",
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
    slug: dateSlug(id === "gold-xauusd" ? "gold-xauusd" : id),
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

export async function generateDailyForecasts(
  options?: GenerateDailyForecastsOptions
): Promise<Article[]> {
  const now = options?.asOfDate
    ? `${options.asOfDate}T06:00:00.000Z`
    : new Date().toISOString();
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

  if (options?.asOfDate) {
    return stampForecastsForDate(forecasts, options.asOfDate);
  }

  return forecasts;
}
