import type { NewsApiArticle } from "@/lib/api/newsapi";
import type { Article } from "@/lib/data/articles";
import type { WireHeadline } from "@/lib/api/wire-types";
import { fetchNewsApiFinance } from "@/lib/api/newsapi";
import { fetchMarketauxNews } from "@/lib/api/marketaux";
import { fetchFinnhubNews } from "@/lib/api/finnhub";
import {
  newsapiToArticle,
  newsapiToWireHeadline,
} from "@/lib/services/newsapi-news";
import {
  marketauxToArticle,
  marketauxToWireHeadline,
} from "@/lib/services/marketaux-news";
import {
  finnhubToArticle,
  finnhubToWireHeadline,
} from "@/lib/services/finnhub-news";
import { saveAutoNews, saveWireCache } from "@/lib/kv/forecasts-store";

export type NewsSyncSource = "payload" | "newsapi" | "marketaux" | "finnhub" | "none";

export type NewsSyncResult = {
  articles: Article[];
  wire: WireHeadline[];
  source: NewsSyncSource;
  fetchedAt: string;
};

async function persistNews(
  articles: Article[],
  wire: WireHeadline[]
): Promise<string> {
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
  return fetchedAt;
}

export async function syncNewsFromPayload(
  raw: NewsApiArticle[]
): Promise<NewsSyncResult> {
  const articles = raw.map(newsapiToArticle);
  const wire = raw.map(newsapiToWireHeadline);
  const fetchedAt = await persistNews(articles, wire);
  return { articles, wire, source: "payload", fetchedAt };
}

export async function syncNewsFromApis(limit = 25): Promise<NewsSyncResult> {
  const newsApiRaw = await fetchNewsApiFinance(limit);
  if (newsApiRaw.length > 0) {
    const articles = newsApiRaw.map(newsapiToArticle);
    const wire = newsApiRaw.map(newsapiToWireHeadline);
    const fetchedAt = await persistNews(articles, wire);
    return { articles, wire, source: "newsapi", fetchedAt };
  }

  const marketauxRaw = await fetchMarketauxNews(limit);
  if (marketauxRaw.length > 0) {
    const articles = marketauxRaw.map(marketauxToArticle);
    const wire = marketauxRaw.map(marketauxToWireHeadline);
    const fetchedAt = await persistNews(articles, wire);
    return { articles, wire, source: "marketaux", fetchedAt };
  }

  const finnhubRaw = await fetchFinnhubNews("general");
  if (finnhubRaw.length > 0) {
    const slice = finnhubRaw.slice(0, limit);
    const articles = slice.map(finnhubToArticle);
    const wire = slice.map(finnhubToWireHeadline);
    const fetchedAt = await persistNews(articles, wire);
    return { articles, wire, source: "finnhub", fetchedAt };
  }

  return {
    articles: [],
    wire: [],
    source: "none",
    fetchedAt: new Date().toISOString(),
  };
}
