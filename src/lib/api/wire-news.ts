import type { Article } from "@/lib/data/articles";
import type { WireHeadline } from "@/lib/api/wire-types";
import { loadAutoNews, loadWireCache } from "@/lib/kv/forecasts-store";
import { resolveImageUrl } from "@/lib/constants/images";
import { fetchFinnhubNews } from "@/lib/api/finnhub";
import { syncNewsFromApis } from "@/lib/services/news-sync";

/** Background refresh when KV cache is older than this (GitHub Actions syncs every 30 min). */
const REFRESH_AFTER_MS = 30 * 60 * 1000;

function normalizeArticle(article: Article): Article {
  return {
    ...article,
    image: resolveImageUrl(article.image, article.category),
  };
}

function shouldBackgroundRefresh(fetchedAt: string | undefined): boolean {
  if (!fetchedAt) return true;
  return Date.now() - new Date(fetchedAt).getTime() > REFRESH_AFTER_MS;
}

export async function getAutoPostedNews(limit = 20): Promise<Article[]> {
  const cached = await loadAutoNews();

  if (cached?.articles?.length) {
    if (shouldBackgroundRefresh(cached.fetchedAt)) {
      syncNewsFromApis(25).catch(() => {});
    }
    return cached.articles.slice(0, limit).map(normalizeArticle);
  }

  const fresh = await syncNewsFromApis(Math.max(limit, 25));
  return fresh.articles.slice(0, limit).map(normalizeArticle);
}

export async function getAutoNewsBySlug(
  slug: string
): Promise<Article | undefined> {
  const cached = await loadAutoNews();
  const fromCache = cached?.articles.find((a) => a.slug === slug);
  if (fromCache) return normalizeArticle(fromCache);

  const fresh = await syncNewsFromApis(30);
  return fresh.articles.find((a) => a.slug === slug);
}

function articleToWire(article: Article): WireHeadline {
  return {
    id: article.slug,
    headline: article.title,
    summary: article.excerpt,
    source: article.sourceName ?? article.author,
    url: article.sourceUrl ?? "",
    datetime: Math.floor(new Date(article.publishedAt).getTime() / 1000),
    image: article.image,
  };
}

export async function getWireHeadlines(limit = 15): Promise<WireHeadline[]> {
  const cached = await loadWireCache();

  if (cached?.items?.length) {
    if (shouldBackgroundRefresh(cached.fetchedAt)) {
      syncNewsFromApis(25).catch(() => {});
    }
    return cached.items.slice(0, limit).map((item) => ({
      id: String(item.id),
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      image: item.image,
    }));
  }

  const autoNews = await loadAutoNews();
  if (autoNews?.articles?.length) {
    if (shouldBackgroundRefresh(autoNews.fetchedAt)) {
      syncNewsFromApis(25).catch(() => {});
    }
    return autoNews.articles.slice(0, limit).map(articleToWire);
  }

  const { wire } = await syncNewsFromApis(Math.max(limit, 25));
  if (wire.length > 0) return wire.slice(0, limit);

  const finnhub = await fetchFinnhubNews("general");
  return finnhub.slice(0, limit).map((item) => ({
    id: String(item.id),
    headline: item.headline,
    summary: item.summary,
    source: item.source,
    url: item.url,
    datetime: item.datetime,
  }));
}
