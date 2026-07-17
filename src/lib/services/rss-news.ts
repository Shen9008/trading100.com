import type { Article, ArticleCategory } from "@/lib/data/articles";
import type { NewsApiArticle } from "@/lib/api/newsapi";
import type { RssFeedItem } from "@/lib/api/rss-feeds";
import { resolveImageUrl } from "@/lib/constants/images";

const TOPIC_KEYWORDS: Record<string, ArticleCategory> = {
  bitcoin: "crypto",
  crypto: "crypto",
  ethereum: "crypto",
  forex: "forex",
  currency: "forex",
  dollar: "forex",
  euro: "forex",
  yen: "forex",
  gold: "commodities",
  oil: "commodities",
  crude: "commodities",
  silver: "commodities",
  commodity: "commodities",
  "s&p": "indices",
  nasdaq: "indices",
  dow: "indices",
  index: "indices",
};

function inferCategory(item: RssFeedItem): ArticleCategory {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  for (const [kw, cat] of Object.entries(TOPIC_KEYWORDS)) {
    if (haystack.includes(kw)) return cat;
  }
  if (/\b(stock|equity|earnings|ipo|share)\b/.test(haystack)) return "stocks";
  if (/\b(fed|gdp|inflation|cpi|jobs|economy|central bank)\b/.test(haystack))
    return "forex";
  return "stocks";
}

function slugFromUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return `rss-${Math.abs(hash).toString(36)}`;
}

function toPublishedAt(pubDate: string): string {
  const parsed = new Date(pubDate);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

export function rssToArticle(item: RssFeedItem): Article {
  const category = inferCategory(item);
  const excerpt =
    item.description.length > 220
      ? `${item.description.slice(0, 217)}…`
      : item.description || item.title;

  const content = `${item.description || item.title}

[Read the full story at ${item.source}](${item.link})

*Syndicated market news from ${item.source}. Trading 100 does not own this content.*`;

  return {
    slug: slugFromUrl(item.link),
    title: item.title,
    excerpt,
    content,
    category,
    author: item.source,
    publishedAt: toPublishedAt(item.pubDate),
    image: resolveImageUrl(null, category),
    isOriginal: false,
    sourceUrl: item.link,
    sourceName: item.source,
  };
}

export function rssToNewsApiArticle(item: RssFeedItem): NewsApiArticle {
  return {
    source: { id: null, name: item.source },
    author: item.source,
    title: item.title,
    description: item.description || item.title,
    url: item.link,
    urlToImage: null,
    publishedAt: toPublishedAt(item.pubDate),
    content: item.description,
  };
}
