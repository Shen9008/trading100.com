import type { Article, ArticleCategory } from "@/lib/data/articles";
import type { FinnhubNewsItem } from "@/lib/api/finnhub";
import type { WireHeadline } from "@/lib/api/wire-types";
import { resolveImageUrl } from "@/lib/constants/images";

function inferCategory(item: FinnhubNewsItem): ArticleCategory {
  const haystack = `${item.headline} ${item.summary}`.toLowerCase();
  if (item.category === "crypto" || /\b(bitcoin|btc|ethereum|crypto)\b/.test(haystack))
    return "crypto";
  if (item.category === "forex" || /\b(forex|currency|dollar|euro)\b/.test(haystack))
    return "forex";
  if (/\b(gold|oil|crude|commodity|silver)\b/.test(haystack)) return "commodities";
  if (/\b(s&p|nasdaq|dow|index)\b/.test(haystack)) return "indices";
  return "stocks";
}

export function finnhubToArticle(item: FinnhubNewsItem): Article {
  const excerpt = item.summary?.trim() || item.headline;
  const content = `${excerpt}

Read the full story at the original publisher: ${item.url}

*Syndicated market news from ${item.source}. Trading 100 does not own this content.*`;

  return {
    slug: `finnhub-${item.id}`,
    title: item.headline,
    excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt,
    content,
    category: inferCategory(item),
    author: item.source,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
    image: resolveImageUrl(item.image, inferCategory(item)),
    isOriginal: false,
    sourceUrl: item.url,
    sourceName: item.source,
  };
}

export function finnhubToWireHeadline(item: FinnhubNewsItem): WireHeadline {
  return {
    id: String(item.id),
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    datetime: item.datetime,
    image: item.image || undefined,
  };
}
