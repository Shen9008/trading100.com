import type { Article } from "./articles";

export const FORECAST_ARTICLES: Article[] = [
  {
    slug: "eur-usd-forecast-july-2026",
    title: "EUR/USD Forecast: Range-Bound Until ECB-Fed Divergence Clarifies",
    excerpt:
      "Our base case sees EUR/USD oscillating between 1.05 and 1.10 until central bank signals align.",
    content: `## Base case (60%)
EUR/USD trades in a 1.05–1.10 range through July, with dips bought on ECB dovish repricing and rallies capped by USD strength.

## Bull case (25%)
A softer US CPI print and dovish Fed minutes push EUR/USD toward 1.12.

## Bear case (15%)
Geopolitical shocks or strong US data break 1.05 support, targeting 1.02.

*Forecasts are opinions for educational purposes only.*`,
    category: "forecast",
    author: "Sarah Chen",
    publishedAt: "2026-07-08T08:00:00Z",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "bitcoin-price-outlook-july-2026",
    title: "Bitcoin Price Outlook: Consolidation Before the Next Leg?",
    excerpt:
      "BTC may build a base between $95K–$110K before macro catalysts resolve direction.",
    content: `## Technical view
Weekly structure remains constructive above the 50-week moving average. A sustained break above resistance could open measured move targets.

## On-chain context
Exchange outflows and long-term holder supply suggest accumulation phases often precede expansion.

## Risks
Macro risk-off events and regulatory headlines can trigger 10–15% drawdowns within uptrends.

*Not financial advice.*`,
    category: "forecast",
    author: "Marcus Webb",
    publishedAt: "2026-07-07T11:00:00Z",
    image: "https://images.unsplash.com/photo-1621761190629-d097e49d8b47?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "gold-xauusd-forecast-summer-2026",
    title: "Gold (XAU/USD) Forecast: Summer Grind Higher on Real Yield Drift",
    excerpt:
      "We expect gold to grind toward new highs if real yields continue to soften.",
    content: `## Scenario analysis
**Base**: Gradual ascent with pullbacks to prior breakout zones acting as support.

**Upside**: Geopolitical escalation + falling real yields = accelerated bid.

**Downside**: Strong US data repricing cuts → gold tests lower support.

*Educational forecast only.*`,
    category: "forecast",
    author: "Elena Rodriguez",
    publishedAt: "2026-07-06T07:30:00Z",
    image: "https://images.unsplash.com/photo-1610375461244-0c3f1a0a5c0e?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "sp500-index-forecast-h2-2026",
    title: "S&P 500 Forecast: Can Breadth Catch Up to Mega-Caps?",
    excerpt:
      "Index-level targets depend on whether earnings broaden beyond the largest names.",
    content: `## H2 2026 outlook
Our base case assumes mid-single-digit index returns, driven by earnings growth but capped by valuation.

## Key levels
Monitor the 50-day and 200-day moving averages for trend health on pullbacks.

## Risks
Policy uncertainty and credit spreads widening could compress multiples quickly.

*For information only.*`,
    category: "forecast",
    author: "James Okonkwo",
    publishedAt: "2026-07-05T10:00:00Z",
    image: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
    isOriginal: true,
  },
];

export type ForecastAssetFilter =
  | "all"
  | "forex"
  | "crypto"
  | "commodities"
  | "indices"
  | "stocks";

const FORECAST_TAGS: Record<string, ForecastAssetFilter[]> = {
  "eur-usd-forecast-july-2026": ["forex"],
  "bitcoin-price-outlook-july-2026": ["crypto"],
  "gold-xauusd-forecast-summer-2026": ["commodities"],
  "sp500-index-forecast-h2-2026": ["indices", "stocks"],
};

export function getForecasts(filter: ForecastAssetFilter = "all"): Article[] {
  if (filter === "all") return FORECAST_ARTICLES;
  return FORECAST_ARTICLES.filter((f) =>
    FORECAST_TAGS[f.slug]?.includes(filter)
  );
}

export function getForecastBySlug(slug: string): Article | undefined {
  return FORECAST_ARTICLES.find((f) => f.slug === slug);
}
