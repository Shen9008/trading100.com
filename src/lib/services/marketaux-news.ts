import type { Article, ArticleCategory } from "@/lib/data/articles";
import type { MarketauxArticle } from "@/lib/api/marketaux";
import type { WireHeadline } from "@/lib/api/wire-types";
import { resolveImageUrl } from "@/lib/constants/images";

function inferCategory(article: MarketauxArticle): ArticleCategory {
  const types = new Set(article.entities.map((e) => e.type.toLowerCase()));

  if (types.has("cryptocurrency") || types.has("crypto")) return "crypto";
  if (types.has("currency") || types.has("forex")) return "forex";
  if (types.has("index") || types.has("indices")) return "indices";
  if (types.has("commodity") || types.has("commodities")) return "commodities";
  if (types.has("equity") || types.has("etf") || types.has("stock"))
    return "stocks";

  const haystack = `${article.title} ${article.description}`.toLowerCase();
  if (/\b(bitcoin|btc|ethereum|crypto|blockchain)\b/.test(haystack))
    return "crypto";
  if (/\b(forex|currency|dollar|euro|yen|gbp\/usd|eur\/usd)\b/.test(haystack))
    return "forex";
  if (/\b(gold|oil|crude|commodity|silver|xau)\b/.test(haystack))
    return "commodities";
  if (/\b(s&p|nasdaq|dow|index)\b/.test(haystack)) return "indices";

  return "stocks";
}

function buildSlug(uuid: string): string {
  return `market-${uuid.replace(/-/g, "").slice(0, 12)}`;
}

export function marketauxToArticle(item: MarketauxArticle): Article {
  const excerpt =
    item.description?.trim() ||
    item.snippet?.trim() ||
    item.title;

  const entityNote =
    item.entities.length > 0
      ? `\n\n**Related symbols:** ${item.entities
          .slice(0, 5)
          .map((e) => e.symbol)
          .join(", ")}`
      : "";

  const content = `${excerpt}

${item.snippet ? `${item.snippet}\n\n` : ""}${entityNote}

[Read the full story at ${item.source}](${item.url})

*Syndicated market news from ${item.source}. Trading 100 does not own this content.*`;

  return {
    slug: buildSlug(item.uuid),
    title: item.title,
    excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt,
    content,
    category: inferCategory(item),
    author: item.source,
    publishedAt: item.published_at,
    image: resolveImageUrl(item.image_url, inferCategory(item)),
    isOriginal: false,
    sourceUrl: item.url,
    sourceName: item.source,
  };
}

export function marketauxToWireHeadline(item: MarketauxArticle): WireHeadline {
  return {
    id: item.uuid,
    headline: item.title,
    summary: item.description || item.snippet,
    source: item.source,
    url: item.url,
    datetime: Math.floor(new Date(item.published_at).getTime() / 1000),
    image: item.image_url ?? undefined,
  };
}
