import type { Article } from "@/lib/data/articles";
import type { WireHeadline } from "@/lib/api/wire-types";
import { loadAutoNews, loadWireCache } from "@/lib/kv/forecasts-store";
import { resolveImageUrl } from "@/lib/constants/images";
import { fetchFinnhubNews } from "@/lib/api/finnhub";
import {
  MAX_AUTO_NEWS_ARCHIVE,
  NEWS_SYNC_BATCH_SIZE,
  syncNewsFromApis,
} from "@/lib/services/news-sync";

/** Background refresh when KV cache is older than this (GitHub Actions syncs every 30 min). */
const REFRESH_AFTER_MS = 30 * 60 * 1000;

/** Below this count, block on sync so pagination has enough articles right away. */
const MIN_ARCHIVE_SIZE = 40;

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

export async function getAutoPostedNews(
  limit = MAX_AUTO_NEWS_ARCHIVE
): Promise<Article[]> {
  const cached = await loadAutoNews();
  const safeLimit = Math.min(Math.max(limit, 1), MAX_AUTO_NEWS_ARCHIVE);

  if (cached?.articles?.length) {
    const needsBackfill = cached.articles.length < MIN_ARCHIVE_SIZE;
    if (needsBackfill || shouldBackgroundRefresh(cached.fetchedAt)) {
      const fresh = await syncNewsFromApis(NEWS_SYNC_BATCH_SIZE);
      return fresh.articles.slice(0, safeLimit).map(normalizeArticle);
    }
    return cached.articles.slice(0, safeLimit).map(normalizeArticle);
  }

  const fresh = await syncNewsFromApis(
    Math.max(safeLimit, NEWS_SYNC_BATCH_SIZE)
  );
  return fresh.articles.slice(0, safeLimit).map(normalizeArticle);
}

export async function getAutoNewsBySlug(
  slug: string
): Promise<Article | undefined> {
  const cached = await loadAutoNews();
  const fromCache = cached?.articles.find((a) => a.slug === slug);
  if (fromCache) return normalizeArticle(fromCache);

  const fresh = await syncNewsFromApis(NEWS_SYNC_BATCH_SIZE);
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
      syncNewsFromApis(NEWS_SYNC_BATCH_SIZE).catch(() => {});
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
      syncNewsFromApis(NEWS_SYNC_BATCH_SIZE).catch(() => {});
    }
    return autoNews.articles.slice(0, limit).map(articleToWire);
  }

  const { wire } = await syncNewsFromApis(
    Math.max(limit, NEWS_SYNC_BATCH_SIZE)
  );
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
