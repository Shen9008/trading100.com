import type { Article } from "@/lib/data/articles";
import type { WireHeadline } from "@/lib/api/wire-types";
import { fetchAllRssItems } from "@/lib/api/rss-feeds";
import { rssToArticle, rssToNewsApiArticle } from "@/lib/services/rss-news";
import {
  mergeAndPersistNews,
  syncNewsFromApis,
  syncNewsFromFinnhub,
  syncNewsFromPayload,
} from "@/lib/services/news-sync";
import type { NewsSyncResult } from "@/lib/services/news-sync";

export const DAILY_NEWS_COUNT = 15;

const TOPIC_FILTERS = [
  /\b(stock|equity|share|earnings|nasdaq|s&p|dow)\b/i,
  /\b(commodity|gold|oil|crude|silver|copper|wheat)\b/i,
  /\b(forex|currency|dollar|euro|yen|pound|fed|ecb|boj)\b/i,
  /\b(economy|gdp|inflation|cpi|jobs|unemployment|recession)\b/i,
  /\b(business|corporate|merger|acquisition|ceo)\b/i,
  /\b(finance|bank|invest|market|trading|bond|yield)\b/i,
];

function matchesFinanceTopics(item: {
  title: string;
  description: string;
}): boolean {
  const text = `${item.title} ${item.description}`;
  return TOPIC_FILTERS.some((re) => re.test(text));
}

function articlesToWire(articles: Article[]): WireHeadline[] {
  return articles.map((a) => ({
    id: a.slug,
    headline: a.title,
    summary: a.excerpt,
    source: a.sourceName ?? a.author,
    url: a.sourceUrl ?? "",
    datetime: Math.floor(new Date(a.publishedAt).getTime() / 1000),
    image: a.image,
  }));
}

async function persistMerged(
  articles: Article[],
  source: NewsSyncResult["source"]
): Promise<NewsSyncResult> {
  const wire = articlesToWire(articles);
  const persisted = await mergeAndPersistNews(articles, wire);
  return { ...persisted, source };
}

/** Daily news subagent: source 15 finance articles (Finnhub primary, RSS/API fallback). */
export async function sourceDailyNewsArticles(
  limit = DAILY_NEWS_COUNT
): Promise<NewsSyncResult> {
  const finnhubResult = await syncNewsFromFinnhub(limit);
  if (finnhubResult.articles.length >= limit) {
    return finnhubResult;
  }

  const rssItems = await fetchAllRssItems(100);
  const onTopic = rssItems.filter(matchesFinanceTopics);

  if (onTopic.length >= limit) {
    const slice = onTopic.slice(0, limit);
    return syncNewsFromPayload(slice.map(rssToNewsApiArticle));
  }

  const apiResult = await syncNewsFromApis(limit);
  if (apiResult.articles.length >= limit) {
    return apiResult;
  }

  const seen = new Set(
    [...finnhubResult.articles, ...apiResult.articles].map(
      (a) => a.sourceUrl ?? a.slug
    )
  );
  const rssExtras = rssItems
    .filter((item) => !seen.has(item.link))
    .slice(0, limit - finnhubResult.articles.length - apiResult.articles.length)
    .map(rssToArticle);

  const merged = [
    ...finnhubResult.articles,
    ...apiResult.articles,
    ...rssExtras,
  ].slice(0, limit);

  if (merged.length === 0) {
    return finnhubResult.articles.length > 0
      ? finnhubResult
      : apiResult;
  }

  const source: NewsSyncResult["source"] =
    finnhubResult.articles.length > 0
      ? "finnhub"
      : apiResult.source !== "none"
        ? apiResult.source
        : "payload";

  return persistMerged(merged, source);
}
