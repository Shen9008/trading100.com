import type { Article } from "@/lib/data/articles";
import { fetchMarketauxNews } from "@/lib/api/marketaux";
import type { WireHeadline } from "@/lib/api/wire-types";
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

async function syncMarketauxNews(limit = 25): Promise<{
  articles: Article[];
  wire: WireHeadline[];
}> {
  const raw = await fetchMarketauxNews(limit);
  const articles = raw.map(marketauxToArticle);
  const wire = raw.map(marketauxToWireHeadline);
  const fetchedAt = new Date().toISOString();

  if (articles.length > 0) {
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

  return { articles, wire };
}

export async function getAutoPostedNews(limit = 20): Promise<Article[]> {
  const cached = await loadAutoNews();
  if (cached?.articles?.length && isCacheFresh(cached.fetchedAt)) {
    return cached.articles.slice(0, limit);
  }

  const fresh = await syncMarketauxNews(Math.max(limit, 25));
  return fresh.articles.slice(0, limit);
}

export async function getAutoNewsBySlug(
  slug: string
): Promise<Article | undefined> {
  const cached = await loadAutoNews();
  const fromCache = cached?.articles.find((a) => a.slug === slug);
  if (fromCache) return fromCache;

  const fresh = await syncMarketauxNews(30);
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

  const { wire } = await syncMarketauxNews(Math.max(limit, 25));
  if (wire.length > 0) return wire.slice(0, limit);

  // Fallback to Finnhub if Marketaux unavailable
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
