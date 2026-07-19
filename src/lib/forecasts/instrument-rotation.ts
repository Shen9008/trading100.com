import type { Article } from "@/lib/data/articles";
import {
  DAILY_BATCH_SIZE,
  forecastMatchesDate,
} from "@/lib/forecasts/daily-coverage";

export { DAILY_BATCH_SIZE };

export type InstrumentCategory = "forex" | "commodities" | "indices" | "crypto";

export type DailyInstrumentId =
  | "bitcoin"
  | "ethereum"
  | "eur-usd"
  | "gbp-usd"
  | "usd-jpy"
  | "aud-usd"
  | "gold-xauusd"
  | "silver-xagusd"
  | "brent-crude"
  | "sp500"
  | "nasdaq-100";

export type InstrumentDefinition = {
  id: DailyInstrumentId;
  label: string;
  category: InstrumentCategory;
  slugPrefix: string;
};

/** Rotating pool aligned with the daily-instrument-analysis agent candidates. */
export const INSTRUMENT_POOL: InstrumentDefinition[] = [
  { id: "eur-usd", label: "EUR/USD", category: "forex", slugPrefix: "eur-usd" },
  { id: "gbp-usd", label: "GBP/USD", category: "forex", slugPrefix: "gbp-usd" },
  { id: "usd-jpy", label: "USD/JPY", category: "forex", slugPrefix: "usd-jpy" },
  { id: "aud-usd", label: "AUD/USD", category: "forex", slugPrefix: "aud-usd" },
  { id: "gold-xauusd", label: "Gold (XAUUSD)", category: "commodities", slugPrefix: "gold-xauusd" },
  { id: "silver-xagusd", label: "Silver (XAGUSD)", category: "commodities", slugPrefix: "silver-xagusd" },
  { id: "brent-crude", label: "Brent Crude", category: "commodities", slugPrefix: "brent-crude" },
  { id: "sp500", label: "S&P 500", category: "indices", slugPrefix: "sp500" },
  { id: "nasdaq-100", label: "Nasdaq 100", category: "indices", slugPrefix: "nasdaq-100" },
  { id: "bitcoin", label: "Bitcoin", category: "crypto", slugPrefix: "bitcoin" },
  { id: "ethereum", label: "Ethereum", category: "crypto", slugPrefix: "ethereum" },
];

const SLUG_PATTERNS: { id: DailyInstrumentId; patterns: RegExp[] }[] = [
  { id: "bitcoin", patterns: [/bitcoin/i, /\bbtc\b/i] },
  { id: "ethereum", patterns: [/ethereum/i, /\beth\b/i] },
  { id: "eur-usd", patterns: [/eur-usd/i, /eurusd/i, /euro-dollar/i] },
  { id: "gbp-usd", patterns: [/gbp-usd/i, /gbpusd/i, /pound-dollar/i, /cable/i] },
  { id: "usd-jpy", patterns: [/usd-jpy/i, /usdjpy/i, /yen/i] },
  { id: "aud-usd", patterns: [/aud-usd/i, /audusd/i, /aussie/i] },
  { id: "gold-xauusd", patterns: [/gold-xauusd/i, /xauusd/i, /\bgold\b/i] },
  { id: "silver-xagusd", patterns: [/silver-xagusd/i, /xagusd/i, /\bsilver\b/i] },
  { id: "brent-crude", patterns: [/brent/i, /crude-oil/i, /ukoil/i] },
  { id: "sp500", patterns: [/sp500/i, /s-p-500/i, /s&p-500/i] },
  { id: "nasdaq-100", patterns: [/nasdaq-100/i, /nasdaq100/i, /\bndx\b/i] },
];

export function inferInstrumentFromArticle(article: Article): DailyInstrumentId | null {
  for (const item of INSTRUMENT_POOL) {
    if (article.slug.startsWith(`${item.slugPrefix}-`)) {
      return item.id;
    }
  }

  const haystack = `${article.slug} ${article.title} ${article.excerpt}`.toLowerCase();
  for (const entry of SLUG_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(haystack))) {
      return entry.id;
    }
  }
  return null;
}

export function getInstrumentsForDate(
  articles: Article[],
  isoDate: string
): DailyInstrumentId[] {
  const ids = new Set<DailyInstrumentId>();
  for (const article of articles) {
    if (!forecastMatchesDate(article, isoDate)) continue;
    const id = inferInstrumentFromArticle(article);
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

function utcDateDaysAgo(daysAgo: number, fromDate = new Date()): string {
  const date = new Date(fromDate);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

/** Instruments featured on the prior UTC calendar day (avoid back-to-back repeats). */
export function getRecentInstrumentIds(
  articles: Article[],
  isoDate: string,
  lookbackDays = 1
): DailyInstrumentId[] {
  const recent = new Set<DailyInstrumentId>();
  for (let daysAgo = 1; daysAgo <= lookbackDays; daysAgo += 1) {
    const priorDate = utcDateDaysAgo(daysAgo, new Date(`${isoDate}T12:00:00.000Z`));
    for (const id of getInstrumentsForDate(articles, priorDate)) {
      recent.add(id);
    }
  }
  return Array.from(recent);
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let state = seed >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dateSeed(isoDate: string): number {
  let hash = 2166136261;
  for (const char of isoDate) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export type SelectDailyInstrumentsOptions = {
  isoDate: string;
  excludeIds?: DailyInstrumentId[];
  batchSize?: number;
};

/**
 * Pick today's instrument batch: 5 unique names, at least 1 forex + 1 commodity,
 * avoiding instruments used on the previous day when alternatives exist.
 */
export function selectDailyInstruments(
  options: SelectDailyInstrumentsOptions
): DailyInstrumentId[] {
  const batchSize = options.batchSize ?? DAILY_BATCH_SIZE;
  const exclude = new Set(options.excludeIds ?? []);
  const shuffled = seededShuffle(INSTRUMENT_POOL, dateSeed(options.isoDate));
  const selected: InstrumentDefinition[] = [];

  const tryAdd = (candidate: InstrumentDefinition) => {
    if (selected.length >= batchSize) return;
    if (selected.some((item) => item.id === candidate.id)) return;
    if (exclude.has(candidate.id) && shuffled.some((alt) => !exclude.has(alt.id) && !selected.some((s) => s.id === alt.id))) {
      return;
    }
    selected.push(candidate);
  };

  const requireCategory = (category: InstrumentCategory) => {
    if (selected.some((item) => item.category === category)) return;
    const match = shuffled.find(
      (item) =>
        item.category === category &&
        !selected.some((s) => s.id === item.id) &&
        (!exclude.has(item.id) ||
          !shuffled.some(
            (alt) =>
              alt.category === category &&
              !exclude.has(alt.id) &&
              !selected.some((s) => s.id === alt.id)
          ))
    );
    if (match) tryAdd(match);
    else {
      const fallback = shuffled.find(
        (item) => item.category === category && !selected.some((s) => s.id === item.id)
      );
      if (fallback) tryAdd(fallback);
    }
  };

  for (const candidate of shuffled) {
    tryAdd(candidate);
  }

  requireCategory("forex");
  requireCategory("commodities");

  for (const candidate of shuffled) {
    tryAdd(candidate);
  }

  return selected.slice(0, batchSize).map((item) => item.id);
}

export function selectDailyInstrumentsFromArchive(
  articles: Article[],
  isoDate: string
): DailyInstrumentId[] {
  const exclude = getRecentInstrumentIds(articles, isoDate, 1);
  return selectDailyInstruments({ isoDate, excludeIds: exclude });
}

export function getInstrumentDefinition(
  id: DailyInstrumentId
): InstrumentDefinition {
  const match = INSTRUMENT_POOL.find((item) => item.id === id);
  if (!match) throw new Error(`Unknown instrument id: ${id}`);
  return match;
}
