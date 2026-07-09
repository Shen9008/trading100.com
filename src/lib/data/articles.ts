export type ArticleCategory =
  | "forex"
  | "crypto"
  | "commodities"
  | "indices"
  | "stocks"
  | "education"
  | "forecast";

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  image: string;
  isOriginal?: boolean;
  sourceUrl?: string;
  sourceName?: string;
};

export const ORIGINAL_ARTICLES: Article[] = [
  {
    slug: "fed-rate-outlook-q2-2026",
    title: "Fed Rate Outlook: What Markets Are Pricing for Q2 2026",
    excerpt:
      "Bond markets and rate futures are sending mixed signals ahead of the next FOMC meeting. We break down what traders should watch.",
    content: `The Federal Reserve's policy path remains the dominant macro narrative for global markets in 2026. With inflation moderating but still above the 2% target in several core categories, traders are debating whether the next move is a hold, a cut, or a longer pause.

## Key drivers to monitor

**Labor market resilience** continues to support a higher-for-longer stance. Non-farm payrolls have surprised to the upside in three of the last four releases, keeping wage pressure in focus.

**Core PCE** remains the Fed's preferred gauge. Markets are pricing roughly 25–50 basis points of cuts by year-end, but that path is highly data-dependent.

**USD implications**: A delayed cutting cycle typically supports the dollar against G10 peers, particularly EUR and JPY crosses.

## Trading takeaway

Rather than betting on a single outcome, consider structuring around event risk: reduce leverage ahead of CPI and FOMC weeks, and use options or defined-risk setups when volatility is cheap.

*This analysis is for educational purposes only and does not constitute financial advice.*`,
    category: "forex",
    author: "Sarah Chen",
    publishedAt: "2026-07-08T10:30:00Z",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "bitcoin-halving-aftermath-2026",
    title: "Bitcoin After the Halving: Supply Dynamics and Institutional Flows",
    excerpt:
      "Post-halving supply compression meets growing ETF inflows. Here's how the crypto market structure is evolving.",
    content: `Bitcoin's latest halving cycle has unfolded against a backdrop of spot ETF adoption and macro cross-currents. Understanding supply-side mechanics helps frame longer-term positioning.

## Supply side

Miner issuance dropped by 50% at the halving, tightening new supply at a time when exchange reserves have trended lower over multi-year horizons.

## Demand side

Institutional products have created a new demand channel. Daily net flows into spot BTC products remain a key sentiment indicator.

## Risk factors

Regulatory headlines, stablecoin policy, and correlation with risk assets (particularly Nasdaq) can override halving narratives in the short term.

*Educational content only — not investment advice.*`,
    category: "crypto",
    author: "Marcus Webb",
    publishedAt: "2026-07-07T14:00:00Z",
    image: "https://images.unsplash.com/photo-1518546304927-5b4aa41e7635?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "gold-safe-haven-2026",
    title: "Gold Holds Near Records as Geopolitical Risk Premium Persists",
    excerpt:
      "XAU/USD continues to attract safe-haven bids. We examine real yields, central bank buying, and key technical levels.",
    content: `Gold has remained bid through the first half of 2026, supported by a combination of geopolitical uncertainty, central bank diversification, and expectations for eventual rate cuts.

## Macro backdrop

Real yields remain the primary inverse driver for gold. When 10-year TIPS yields fall, non-yielding bullion typically benefits.

## Technical levels

Watch the prior all-time high zone for breakout confirmation. A weekly close above resistance could trigger momentum follow-through.

## Portfolio context

Gold often serves as a diversifier rather than a directional bet. Position sizing matters given volatility spikes around macro events.

*For informational purposes only.*`,
    category: "commodities",
    author: "Elena Rodriguez",
    publishedAt: "2026-07-06T09:15:00Z",
    image: "https://images.unsplash.com/photo-1610375461244-0c3f1a0a5c0e?w=800&q=80",
    isOriginal: true,
  },
  {
    slug: "sp500-earnings-season-preview",
    title: "S&P 500 Earnings Season: Magnificent Seven vs. The Rest",
    excerpt:
      "Concentration risk in mega-cap tech earnings could drive index volatility. Our preview of sectors to watch.",
    content: `Q2 earnings season arrives with the S&P 500 near record highs and valuation multiples above historical averages. The dispersion between mega-cap tech and the broader index has rarely been wider.

## What matters

**Guidance tone** on AI capex, cloud growth, and consumer spending will set the narrative.

**Breadth**: If beat rates improve outside the top 10 names, bulls may argue for a healthier rally.

**Macro**: Tariff and trade policy headlines could overshadow individual prints.

*Not a recommendation to buy or sell any security.*`,
    category: "stocks",
    author: "James Okonkwo",
    publishedAt: "2026-07-05T16:45:00Z",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
    isOriginal: true,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ORIGINAL_ARTICLES.find((a) => a.slug === slug);
}

export async function resolveArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  const { getAutoNewsBySlug } = await import("@/lib/api/wire-news");
  return (await getAutoNewsBySlug(slug)) ?? getArticleBySlug(slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return ORIGINAL_ARTICLES.filter((a) => a.category === category);
}

export function getLatestArticles(limit = 10): Article[] {
  return [...ORIGINAL_ARTICLES]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export async function getMergedLatestArticles(
  limit = 10
): Promise<Article[]> {
  const { getAutoPostedNews } = await import("@/lib/api/wire-news");
  const [auto, editorial] = await Promise.all([
    getAutoPostedNews(limit),
    Promise.resolve(getLatestArticles(limit)),
  ]);

  return [...auto, ...editorial]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export function getFeaturedArticles(): Article[] {
  return ORIGINAL_ARTICLES.slice(0, 4);
}
