import type { Article } from "@/lib/data/articles";
import { FORECAST_ARTICLES } from "@/lib/data/forecasts";

const FORECAST_SLUGS = new Set(FORECAST_ARTICLES.map((f) => f.slug));

export function isForecastSlug(slug: string): boolean {
  if (FORECAST_SLUGS.has(slug)) return true;
  return (
    slug.includes("-forecast-") ||
    slug.includes("-forecast-today-") ||
    /-auto-\d{4}-\d{2}-\d{2}$/.test(slug)
  );
}

export function isForecastArticle(article: Article): boolean {
  return (
    article.category === "forecast" ||
    isForecastSlug(article.slug) ||
    FORECAST_SLUGS.has(article.slug)
  );
}

export function forecastArticlePath(slug: string): string {
  return `/forecasts/${slug}`;
}

/** Canonical public URL path for any article (news or forecast). */
export function articlePublicPath(article: Article): string {
  return isForecastArticle(article)
    ? forecastArticlePath(article.slug)
    : `/news/${article.slug}`;
}
