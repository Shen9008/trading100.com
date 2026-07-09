import type { Article } from "@/lib/data/articles";
import { fetchNewsApiFinance } from "@/lib/api/newsapi";
import { fetchMarketauxNews } from "@/lib/api/marketaux";
import type { WireHeadline } from "@/lib/api/wire-types";
import {
  newsapiToArticle,
  newsapiToWireHeadline,
} from "@/lib/services/newsapi-news";
import {
  marketauxToArticle,
  marketauxToWireHeadline,
} from "@/lib/services/marketaux-news";
import {
  loadAutoNews,
  loadWireCache,
  saveAutoNews,
  saveWireCache,
} from "@/lib/kv/forecasts-store";
import { fetchFinnhubNews } from "@/lib/api/finnhub";

const CACHE_TTL_MS = 5 * 60 * 1000;

function isCacheFresh(fetchedAt: string | undefined): boolean {
  if (!fetchedAt) return false;
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_TTL_MS;
}

async function syncAutoNews(limit = 25): Promise<{
  articles: Article[];
  wire: WireHeadline[];
}> {
  const newsApiRaw = await fetchNewsApiFinance(limit);
  if (newsApiRaw.length > 0) {
    const articles = newsApiRaw.map(newsapiToArticle);
    const wire = newsApiRaw.map(newsapiToWireHeadline);
    await persistNews(articles, wire);
    return { articles, wire };
  }

  const marketauxRaw = await fetchMarketauxNews(limit);
  if (marketauxRaw.length > 0) {
    const articles = marketauxRaw.map(marketauxToArticle);
    const wire = marketauxRaw.map(marketauxToWireHeadline);
    await persistNews(articles, wire);
    return { articles, wire };
  }

  return { articles: [], wire: [] };
}

async function persistNews(
  articles: Article[],
  wire: WireHeadline[]
): Promise<void> {
  const fetchedAt = new Date().toISOString();
  await saveAutoNews({ fetchedAt, articles });
  await saveWireCache({
    fetchedAt,
    items: wire.map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      datetime: item.datetime,
      image: item.image,
    })),
  });
}

export async function getAutoPostedNews(limit = 20): Promise<Article[]> {
  const cached = await loadAutoNews();
  if (cached?.articles?.length && isCacheFresh(cached.fetchedAt)) {
    return cached.articles.slice(0, limit);
  }

  const fresh = await syncAutoNews(Math.max(limit, 25));
  return fresh.articles.slice(0, limit);
}

export async function getAutoNewsBySlug(
  slug: string
): Promise<Article | undefined> {
  const cached = await loadAutoNews();
  const fromCache = cached?.articles.find((a) => a.slug === slug);
  if (fromCache) return fromCache;

  const fresh = await syncAutoNews(30);
  return fresh.articles.find((a) => a.slug === slug);
}

export async function getWireHeadlines(limit = 15): Promise<WireHeadline[]> {
  const cached = await loadWireCache();
  if (cached?.items?.length && isCacheFresh(cached.fetchedAt)) {
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

  const { wire } = await syncAutoNews(Math.max(limit, 25));
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
