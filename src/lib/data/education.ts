import { STOCK_IMAGES } from "@/lib/constants/images";

export type EducationGuide = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  readTime: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  publishedAt: string;
  image: string;
  faqs?: { question: string; answer: string }[];
};

export const EDUCATION_GUIDES: EducationGuide[] = [
  {
    slug: "how-to-trade-forex",
    title: "How to Trade Forex: A Beginner's Roadmap",
    excerpt:
      "Learn currency pair basics, pip value, leverage risks, and how to read a forex quote.",
    readTime: "12 min",
    level: "Beginner",
    publishedAt: "2026-06-01T00:00:00Z",
    image: STOCK_IMAGES.forex,
    content: `Forex (foreign exchange) is the global marketplace for trading currencies. With over $7 trillion in daily turnover, it is the largest financial market in the world.

## What is a currency pair?

A pair like EUR/USD shows how many US dollars one euro buys. The first currency is the **base**, the second is the **quote**.

## Pips and lot sizes

A pip is typically the fourth decimal place (0.0001) for most pairs. Lot size determines your exposure — standard lots are 100,000 units of the base currency.

## Leverage and risk

Leverage amplifies both gains and losses. Always define risk per trade (commonly 1–2% of account equity) and use stop-loss orders.

## Getting started

1. Learn major pairs (EUR/USD, GBP/USD, USD/JPY)
2. Understand session overlaps (London/NY)
3. Practice on a demo account before going live
4. Keep a trading journal

*Educational content only — not financial advice.*`,
    faqs: [
      {
        question: "What is the best time to trade forex?",
        answer:
          "The London–New York overlap (roughly 8:00–12:00 ET) typically offers the highest liquidity and tightest spreads for major pairs.",
      },
      {
        question: "How much money do I need to start?",
        answer:
          "You can open micro accounts with small deposits, but focus on education and risk management rather than minimum capital.",
      },
    ],
  },
  {
    slug: "how-to-read-rsi",
    title: "How to Read RSI: Overbought, Oversold, and Divergence",
    excerpt:
      "The Relative Strength Index helps gauge momentum. Learn settings, signals, and common pitfalls.",
    readTime: "8 min",
    level: "Intermediate",
    publishedAt: "2026-06-15T00:00:00Z",
    image: STOCK_IMAGES.education,
    content: `RSI (Relative Strength Index) is a momentum oscillator ranging from 0 to 100, developed by J. Welles Wilder.

## Default settings

The standard period is 14. Readings above 70 are often labeled overbought; below 30, oversold.

## Trending markets caution

In strong uptrends, RSI can remain elevated for extended periods. Treat overbought/oversold as context, not automatic reversal signals.

## Divergence

When price makes a new high but RSI makes a lower high, **bearish divergence** may warn of weakening momentum.

## Practical tips

- Combine RSI with trend structure (higher highs/lows)
- Use on multiple timeframes for confluence
- Avoid over-optimizing parameters on historical data

*For educational purposes only.*`,
    faqs: [
      {
        question: "What RSI setting should I use?",
        answer:
          "14 is the standard. Shorter periods (7) are more sensitive; longer (21) are smoother.",
      },
    ],
  },
  {
    slug: "understanding-candlestick-patterns",
    title: "Understanding Candlestick Patterns for Price Action",
    excerpt:
      "From doji to engulfing patterns — learn what candles communicate about buyer/seller balance.",
    readTime: "10 min",
    level: "Beginner",
    publishedAt: "2026-06-20T00:00:00Z",
    image: STOCK_IMAGES.stocks,
    content: `Japanese candlesticks visualize open, high, low, and close (OHLC) for each period.

## Single-candle patterns

**Doji**: Open ≈ close — indecision.
**Hammer**: Small body, long lower wick — potential rejection of lower prices.

## Multi-candle patterns

**Bullish engulfing**: Larger green body fully covers prior red body — potential reversal signal at support.

## Context matters

Patterns work best at key levels (support/resistance, moving averages) with volume confirmation.

*Not trading advice.*`,
  },
  {
    slug: "risk-management-for-traders",
    title: "Risk Management for Traders: The Non-Negotiable Foundation",
    excerpt:
      "Position sizing, stop-loss placement, and drawdown rules that protect capital.",
    readTime: "15 min",
    level: "Beginner",
    publishedAt: "2026-07-01T00:00:00Z",
    image: STOCK_IMAGES.risk,
    content: `Risk management separates long-term participants from those who blow up accounts.

## The 1% rule

Risk no more than 1–2% of account equity on a single trade. This keeps drawdowns survivable.

## Position sizing formula

Position Size = (Account Risk $) / (Stop Distance in $)

## Correlation risk

Multiple positions in correlated assets (e.g., EUR/USD + GBP/USD) multiply exposure.

## Psychological edge

Predefined rules reduce emotional decisions during volatility.

*Educational only.*`,
    faqs: [
      {
        question: "Should I always use a stop-loss?",
        answer:
          "For most retail traders, yes. Defined risk prevents catastrophic losses from gap moves or leverage.",
      },
    ],
  },
];

export function getEducationGuides(): EducationGuide[] {
  return EDUCATION_GUIDES;
}

export function getEducationGuide(slug: string): EducationGuide | undefined {
  return EDUCATION_GUIDES.find((g) => g.slug === slug);
}

export function getEducationTeasers(limit = 4): EducationGuide[] {
  return EDUCATION_GUIDES.slice(0, limit);
}
