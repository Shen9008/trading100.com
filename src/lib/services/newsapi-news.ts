import type { Article, ArticleCategory } from "@/lib/data/articles";
import type { NewsApiArticle } from "@/lib/api/newsapi";
import type { WireHeadline } from "@/lib/api/wire-types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80";

function slugFromUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return `news-${Math.abs(hash).toString(36)}`;
}

function inferCategory(article: NewsApiArticle): ArticleCategory {
  const haystack = `${article.title} ${article.description ?? ""}`.toLowerCase();
  if (/\b(bitcoin|btc|ethereum|crypto|blockchain)\b/.test(haystack))
    return "crypto";
  if (/\b(forex|currency|dollar|euro|yen|gbp\/usd|eur\/usd)\b/.test(haystack))
    return "forex";
  if (/\b(gold|oil|crude|commodity|silver|xau)\b/.test(haystack))
    return "commodities";
  if (/\b(s&p|nasdaq|dow|index)\b/.test(haystack)) return "indices";
  return "stocks";
}

export function newsapiToArticle(item: NewsApiArticle): Article {
  const sourceName = item.source.name;
  const excerpt = item.description?.trim() || item.title;
  const body = item.content?.replace(/\[\+\d+ chars\]$/, "").trim();

  const content = `${excerpt}

${body ? `${body}\n\n` : ""}Read the full story at the original publisher: ${item.url}

*Syndicated market news from ${sourceName}. Trading 100 does not own this content.*`;

  return {
    slug: slugFromUrl(item.url),
    title: item.title,
    excerpt: excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt,
    content,
    category: inferCategory(item),
    author: item.author || sourceName,
    publishedAt: item.publishedAt,
    image: item.urlToImage || FALLBACK_IMAGE,
    isOriginal: false,
    sourceUrl: item.url,
    sourceName,
  };
}

export function newsapiToWireHeadline(item: NewsApiArticle): WireHeadline {
  return {
    id: slugFromUrl(item.url),
    headline: item.title,
    summary: item.description || "",
    source: item.source.name,
    url: item.url,
    datetime: Math.floor(new Date(item.publishedAt).getTime() / 1000),
    image: item.urlToImage ?? undefined,
  };
}
