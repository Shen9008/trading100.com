import type { Article } from "@/lib/data/articles";
import {
  type DailyInstrumentId,
  getInstrumentDefinition,
  selectDailyInstruments,
  selectDailyInstrumentsFromArchive,
} from "@/lib/forecasts/instrument-rotation";
import {
  buildForecastFromSnapshot,
  buildMinimalFallbackArticle,
} from "@/lib/services/forecast-content-builder";
import { getInstrumentSnapshot } from "@/lib/services/market-analysis";

export { DAILY_BATCH_SIZE } from "@/lib/forecasts/daily-coverage";

const HEADLINE_KEYWORDS: Record<DailyInstrumentId, RegExp[]> = {
  bitcoin: [/bitcoin/i, /\bbtc\b/i, /crypto/i],
  ethereum: [/ethereum/i, /\beth\b/i, /crypto/i],
  "eur-usd": [/eur/i, /euro/i, /ecb/i, /eurozone/i],
  "gbp-usd": [/gbp/i, /pound/i, /sterling/i, /boe/i, /uk\b/i, /cable/i],
  "usd-jpy": [/yen/i, /jpy/i, /boj/i, /japan/i],
  "aud-usd": [/aud/i, /aussie/i, /australia/i, /rba/i],
  "gold-xauusd": [/gold/i, /xau/i, /bullion/i],
  "silver-xagusd": [/silver/i, /xag/i],
  "brent-crude": [/brent/i, /crude/i, /oil\b/i, /opec/i, /wti/i],
  sp500: [/s&p/i, /sp500/i, /wall street/i, /stock/i, /equit/i],
  "nasdaq-100": [/nasdaq/i, /tech stock/i, /\bndx\b/i],
};

export type GenerateDailyForecastsOptions = {
  /** Publish as a specific UTC calendar day (YYYY-MM-DD). */
  asOfDate?: string;
  /** Existing archive — used to avoid repeating yesterday's instruments. */
  archiveArticles?: Article[];
  /** Pre-selected instrument batch (skips rotation when provided). */
  instrumentIds?: DailyInstrumentId[];
};

export function resolveDailyInstrumentIds(
  options: Pick<
    GenerateDailyForecastsOptions,
    "asOfDate" | "archiveArticles" | "instrumentIds"
  >
): DailyInstrumentId[] {
  const isoDate = options.asOfDate ?? new Date().toISOString().slice(0, 10);
  if (options.instrumentIds?.length) return options.instrumentIds;
  if (options.archiveArticles?.length) {
    return selectDailyInstrumentsFromArchive(options.archiveArticles, isoDate);
  }
  return selectDailyInstruments({ isoDate });
}

export function stampForecastsForDate(
  forecasts: Article[],
  isoDate: string
): Article[] {
  const publishedAt = `${isoDate}T06:00:00.000Z`;

  return forecasts.map((forecast) => ({
    ...forecast,
    publishedAt,
    slug: forecast.slug.replace(/-auto-\d{4}-\d{2}-\d{2}$/, `-auto-${isoDate}`),
  }));
}

async function getRelevantHeadline(
  instrumentId: DailyInstrumentId
): Promise<string | undefined> {
  try {
    const { getWireHeadlines } = await import("@/lib/api/wire-news");
    const headlines = await getWireHeadlines(20);
    const patterns = HEADLINE_KEYWORDS[instrumentId];

    const match = headlines.find((item) =>
      patterns.some((re) => re.test(item.headline))
    );
    if (match) return match.headline;

    return headlines[0]?.headline;
  } catch {
    return undefined;
  }
}

function categoryForInstrument(id: DailyInstrumentId): Article["category"] {
  const def = getInstrumentDefinition(id);
  if (def.category === "forex") return "forex";
  if (def.category === "crypto") return "crypto";
  if (def.category === "indices") return "indices";
  return "commodities";
}

async function generateInstrumentForecast(
  instrumentId: DailyInstrumentId,
  now: string
): Promise<Article> {
  const def = getInstrumentDefinition(instrumentId);
  const headline = await getRelevantHeadline(instrumentId);

  try {
    const isoDate = now.slice(0, 10);
    const snapshot = await getInstrumentSnapshot(
      instrumentId,
      def.label,
      isoDate
    );
    if (snapshot) {
      return buildForecastFromSnapshot(snapshot, now, headline);
    }
  } catch {
    // fall through to minimal fallback
  }

  return buildMinimalFallbackArticle(
    instrumentId,
    def.label,
    now,
    headline,
    categoryForInstrument(instrumentId)
  );
}

export async function generateDailyForecasts(
  options?: GenerateDailyForecastsOptions
): Promise<Article[]> {
  const isoDate = options?.asOfDate ?? new Date().toISOString().slice(0, 10);
  const now = `${isoDate}T06:00:00.000Z`;
  const instrumentIds = resolveDailyInstrumentIds({
    asOfDate: isoDate,
    archiveArticles: options?.archiveArticles,
    instrumentIds: options?.instrumentIds,
  });

  const forecasts = await Promise.all(
    instrumentIds.map((id) => generateInstrumentForecast(id, now))
  );

  if (options?.asOfDate) {
    return stampForecastsForDate(forecasts, options.asOfDate);
  }

  return forecasts;
}
