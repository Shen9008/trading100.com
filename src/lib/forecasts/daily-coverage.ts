import type { Article } from "@/lib/data/articles";

/** Number of forecast articles published each calendar day. */
export const DAILY_BATCH_SIZE = 5;

export const DAILY_FORECAST_TARGET = DAILY_BATCH_SIZE;

/** First calendar day the 5-article daily automation is required (after static seed content). */
export const DAILY_AUTOMATION_START = "2026-07-11";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

/** Slug fragment for prose dates, e.g. 2026-07-13 → july-13-2026 */
export function isoDateToProseSlugFragment(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return isoDate;
  return `${MONTH_NAMES[monthIndex]}-${Number(day)}-${year}`;
}

export function forecastMatchesDate(article: Article, date: string): boolean {
  if (article.publishedAt.slice(0, 10) === date) return true;
  if (article.slug.includes(date)) return true;

  const prose = isoDateToProseSlugFragment(date);
  if (article.slug.includes(prose)) return true;

  return false;
}

export function countForecastsForDate(
  articles: Article[],
  date: string
): number {
  return articles.filter((article) => forecastMatchesDate(article, date))
    .length;
}

export function hasFullDailyBatch(
  articles: Article[],
  date: string,
  target = DAILY_FORECAST_TARGET
): boolean {
  return countForecastsForDate(articles, date) >= target;
}

export function utcDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

/** Returns ISO dates (oldest first) missing a full daily batch in the lookback window. */
export function findMissingDates(
  articles: Article[],
  daysBack: number,
  target = DAILY_FORECAST_TARGET,
  onlyOnOrAfter = DAILY_AUTOMATION_START
): string[] {
  const missing: string[] = [];

  for (let daysAgo = daysBack - 1; daysAgo >= 0; daysAgo -= 1) {
    const date = utcDateDaysAgo(daysAgo);
    if (date < onlyOnOrAfter) continue;
    if (!hasFullDailyBatch(articles, date, target)) {
      missing.push(date);
    }
  }

  return missing;
}

export function mergeArticlesBySlug(...groups: Article[][]): Article[] {
  const bySlug = new Map<string, Article>();
  for (const group of groups) {
    for (const article of group) {
      bySlug.set(article.slug, article);
    }
  }
  return Array.from(bySlug.values());
}

/** ISO dates (oldest first) that have template (-auto-) forecasts in the lookback window. */
export function findAutoForecastDates(
  articles: Article[],
  daysBack: number,
  onlyOnOrAfter = DAILY_AUTOMATION_START
): string[] {
  const earliest = utcDateDaysAgo(Math.max(daysBack - 1, 0));
  const start = earliest > onlyOnOrAfter ? earliest : onlyOnOrAfter;
  const dates = new Set<string>();

  for (const article of articles) {
    if (!article.slug.includes("-auto-")) continue;
    const date = article.publishedAt.slice(0, 10);
    if (date < start) continue;
    dates.add(date);
  }

  return Array.from(dates).sort();
}
