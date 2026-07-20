import type { NewsApiArticle } from "@/lib/api/newsapi";

import type { Article } from "@/lib/data/articles";

import type { WireHeadline } from "@/lib/api/wire-types";

import { fetchNewsApiFinance } from "@/lib/api/newsapi";

import { fetchMarketauxNews } from "@/lib/api/marketaux";

import { fetchFinnhubFinanceNews } from "@/lib/api/finnhub";

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

import {

  loadAutoNews,

  loadWireCache,

  saveAutoNews,

  saveWireCache,

  type WireCache,

} from "@/lib/kv/forecasts-store";



/** Headlines fetched per sync pass from upstream APIs. */

export const NEWS_SYNC_BATCH_SIZE = 100;



/** Maximum syndicated articles kept in KV for news pagination. */

export const MAX_AUTO_NEWS_ARCHIVE = 200;



export type NewsSyncSource = "payload" | "newsapi" | "marketaux" | "finnhub" | "none";



export type NewsSyncResult = {

  articles: Article[];

  wire: WireHeadline[];

  source: NewsSyncSource;

  fetchedAt: string;

};



function sortArticlesDesc(articles: Article[]): Article[] {

  return [...articles].sort(

    (a, b) =>

      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()

  );

}



export function mergeArticleArchive(

  existing: Article[],

  incoming: Article[]

): Article[] {

  const bySlug = new Map<string, Article>();

  for (const article of incoming) bySlug.set(article.slug, article);

  for (const article of existing) {

    if (!bySlug.has(article.slug)) bySlug.set(article.slug, article);

  }

  return sortArticlesDesc(Array.from(bySlug.values())).slice(

    0,

    MAX_AUTO_NEWS_ARCHIVE

  );

}



function mergeWireArchive(

  existing: WireCache["items"],

  incoming: WireHeadline[]

): WireCache["items"] {

  const byId = new Map<string, WireCache["items"][number]>();

  for (const item of incoming) {

    byId.set(String(item.id), {

      id: String(item.id),

      headline: item.headline,

      summary: item.summary,

      source: item.source,

      url: item.url,

      datetime: item.datetime,

      image: item.image,

    });

  }

  for (const item of existing) {

    if (!byId.has(String(item.id))) byId.set(String(item.id), item);

  }

  return Array.from(byId.values())

    .sort((a, b) => b.datetime - a.datetime)

    .slice(0, MAX_AUTO_NEWS_ARCHIVE);

}



export async function mergeAndPersistNews(

  articles: Article[],

  wire: WireHeadline[]

): Promise<{ fetchedAt: string; articles: Article[]; wire: WireHeadline[] }> {

  const existing = await loadAutoNews();

  const existingWire = await loadWireCache();



  const mergedArticles = mergeArticleArchive(

    existing?.articles ?? [],

    articles

  );

  const mergedWireItems = mergeWireArchive(existingWire?.items ?? [], wire);



  const fetchedAt = new Date().toISOString();

  await saveAutoNews({ fetchedAt, articles: mergedArticles });

  await saveWireCache({ fetchedAt, items: mergedWireItems });



  const mergedWire: WireHeadline[] = mergedWireItems.map((item) => ({

    id: item.id,

    headline: item.headline,

    summary: item.summary,

    source: item.source,

    url: item.url,

    datetime: item.datetime,

    image: item.image,

  }));



  return { fetchedAt, articles: mergedArticles, wire: mergedWire };

}



export async function syncNewsFromPayload(

  raw: NewsApiArticle[]

): Promise<NewsSyncResult> {

  const articles = raw.map(newsapiToArticle);

  const wire = raw.map(newsapiToWireHeadline);

  const persisted = await mergeAndPersistNews(articles, wire);

  return { ...persisted, source: "payload" };

}



export async function syncNewsFromFinnhub(

  limit = NEWS_SYNC_BATCH_SIZE

): Promise<NewsSyncResult> {

  const finnhubRaw = await fetchFinnhubFinanceNews(limit);

  if (finnhubRaw.length === 0) {

    return {

      articles: [],

      wire: [],

      source: "none",

      fetchedAt: new Date().toISOString(),

    };

  }



  const articles = finnhubRaw.map(finnhubToArticle);

  const wire = finnhubRaw.map(finnhubToWireHeadline);

  const persisted = await mergeAndPersistNews(articles, wire);

  return { ...persisted, source: "finnhub" };

}



export async function syncNewsFromApis(

  limit = NEWS_SYNC_BATCH_SIZE

): Promise<NewsSyncResult> {

  const finnhubResult = await syncNewsFromFinnhub(limit);

  if (finnhubResult.articles.length > 0) {

    return finnhubResult;

  }



  const newsApiRaw = await fetchNewsApiFinance(limit);

  if (newsApiRaw.length > 0) {

    const articles = newsApiRaw.map(newsapiToArticle);

    const wire = newsApiRaw.map(newsapiToWireHeadline);

    const persisted = await mergeAndPersistNews(articles, wire);

    return { ...persisted, source: "newsapi" };

  }



  const marketauxRaw = await fetchMarketauxNews(limit);

  if (marketauxRaw.length > 0) {

    const articles = marketauxRaw.map(marketauxToArticle);

    const wire = marketauxRaw.map(marketauxToWireHeadline);

    const persisted = await mergeAndPersistNews(articles, wire);

    return { ...persisted, source: "marketaux" };

  }



  return {

    articles: [],

    wire: [],

    source: "none",

    fetchedAt: new Date().toISOString(),

  };

}

