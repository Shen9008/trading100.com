import type { MetadataRoute } from "next";
import { SITE_URL, ASSET_CLASSES } from "@/lib/constants";
import { MARKET_INSTRUMENTS } from "@/lib/data/market-instruments";
import { ORIGINAL_ARTICLES } from "@/lib/data/articles";
import type { Article } from "@/lib/data/articles";
import { FORECAST_ARTICLES } from "@/lib/data/forecasts";
import { getEducationGuides } from "@/lib/data/education";
import { loadAutoNews } from "@/lib/kv/forecasts-store";
import { loadDailyForecasts } from "@/lib/kv/forecasts-store";
import { articlePublicPath, isForecastArticle } from "@/lib/forecasts/paths";

export const revalidate = 3600;

function articleSitemapEntry(
  article: Article,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${articlePublicPath(article)}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/markets",
    "/news",
    "/forecasts",
    "/education",
    "/tools/economic-calendar",
    "/tools/currency-converter",
    "/about",
    "/contact",
    "/disclaimer",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const marketPages = ASSET_CLASSES.flatMap((ac) =>
    MARKET_INSTRUMENTS[ac.id].map((item) => {
      const slug =
        item.slug ?? item.symbol.toLowerCase().replace("/", "-");
      return {
        url: `${SITE_URL}/markets/${ac.slug}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.7,
      };
    })
  );

  const staticArticleSlugs = new Set(
    [...ORIGINAL_ARTICLES, ...FORECAST_ARTICLES].map((a) => a.slug)
  );

  const newsArticlePages = ORIGINAL_ARTICLES.map((a) =>
    articleSitemapEntry(a, 0.6, "weekly")
  );

  const forecastArticlePages = FORECAST_ARTICLES.map((a) =>
    articleSitemapEntry(a, 0.65, "weekly")
  );

  // Dynamic KV content
  let dynamicNewsPages: MetadataRoute.Sitemap = [];
  let dynamicForecastPages: MetadataRoute.Sitemap = [];
  try {
    const [autoNews, dailyForecasts] = await Promise.all([
      loadAutoNews(),
      loadDailyForecasts(),
    ]);

    const seenNews = new Set<string>();
    dynamicNewsPages = (autoNews?.articles ?? [])
      .filter((a) => !staticArticleSlugs.has(a.slug))
      .filter((a) => a.isOriginal === true)
      .filter((a) => !isForecastArticle(a))
      .filter((a) => {
        if (seenNews.has(a.slug)) return false;
        seenNews.add(a.slug);
        return true;
      })
      .map((a) => articleSitemapEntry(a, 0.55, "daily"));

    const seenForecasts = new Set<string>();
    dynamicForecastPages = dailyForecasts
      .filter((a) => !staticArticleSlugs.has(a.slug))
      .filter((a) => {
        if (seenForecasts.has(a.slug)) return false;
        seenForecasts.add(a.slug);
        return true;
      })
      .map((a) => articleSitemapEntry(a, 0.65, "daily"));
  } catch {
    /* KV unavailable at build time */
  }

  const educationPages = getEducationGuides().map((g) => ({
    url: `${SITE_URL}/education/${g.slug}`,
    lastModified: new Date(g.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [
    ...staticPages,
    ...marketPages,
    ...newsArticlePages,
    ...forecastArticlePages,
    ...dynamicNewsPages,
    ...dynamicForecastPages,
    ...educationPages,
  ];
}
