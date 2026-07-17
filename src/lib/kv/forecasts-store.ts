import type { Article } from "@/lib/data/articles";

const KV_KEY_LATEST = "forecasts:latest";
const KV_KEY_ARCHIVE = "forecasts:archive";
const KV_KEY_WIRE = "news:wire-cache";
const KV_KEY_AUTO_NEWS = "news:auto-posts";

/** Keep published forecasts for 30 days (refreshed on each daily publish). */
const FORECAST_KV_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_ARCHIVE_FORECASTS = 150;

export type WireCache = {
  fetchedAt: string;
  items: {
    id: string;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
    image?: string;
  }[];
};

export type AutoNewsCache = {
  fetchedAt: string;
  articles: Article[];
};

export type DailyForecastsPayload = {
  generatedAt: string;
  forecasts: Article[];
};

export type ForecastArchivePayload = {
  updatedAt: string;
  forecasts: Article[];
};

type KVBinding = KVNamespace | undefined;

async function getKV(): Promise<KVBinding> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx.env as { FORECASTS_KV?: KVNamespace };
    return env.FORECASTS_KV;
  } catch {
    return undefined;
  }
}

function sortByPublishedDesc(forecasts: Article[]): Article[] {
  return [...forecasts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function mergeForecastArchive(
  existing: Article[],
  incoming: Article[]
): Article[] {
  const bySlug = new Map<string, Article>();
  for (const article of existing) bySlug.set(article.slug, article);
  for (const article of incoming) bySlug.set(article.slug, article);
  return sortByPublishedDesc(Array.from(bySlug.values())).slice(
    0,
    MAX_ARCHIVE_FORECASTS
  );
}

async function readArchive(kv: KVNamespace): Promise<Article[]> {
  try {
    const raw = await kv.get(KV_KEY_ARCHIVE);
    if (!raw) return [];
    const data = JSON.parse(raw) as ForecastArchivePayload;
    return data.forecasts ?? [];
  } catch {
    return [];
  }
}

async function readLatest(kv: KVNamespace): Promise<DailyForecastsPayload | null> {
  try {
    const raw = await kv.get(KV_KEY_LATEST);
    if (!raw) return null;
    return JSON.parse(raw) as DailyForecastsPayload;
  } catch {
    return null;
  }
}

export async function saveDailyForecasts(forecasts: Article[]): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  const latestPayload: DailyForecastsPayload = {
    generatedAt: new Date().toISOString(),
    forecasts,
  };

  await kv.put(KV_KEY_LATEST, JSON.stringify(latestPayload), {
    expirationTtl: FORECAST_KV_TTL_SECONDS,
  });

  const archived = mergeForecastArchive(await readArchive(kv), forecasts);
  const archivePayload: ForecastArchivePayload = {
    updatedAt: new Date().toISOString(),
    forecasts: archived,
  };

  await kv.put(KV_KEY_ARCHIVE, JSON.stringify(archivePayload), {
    expirationTtl: FORECAST_KV_TTL_SECONDS,
  });
}

export async function loadDailyForecasts(): Promise<Article[]> {
  const kv = await getKV();
  if (!kv) return [];

  const archived = await readArchive(kv);
  if (archived.length > 0) return archived;

  const latest = await readLatest(kv);
  return latest?.forecasts ?? [];
}

export async function loadLatestDailyForecasts(): Promise<DailyForecastsPayload | null> {
  const kv = await getKV();
  if (!kv) return null;
  return readLatest(kv);
}

export async function saveWireCache(cache: WireCache): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  await kv.put(KV_KEY_WIRE, JSON.stringify(cache), {
    expirationTtl: 60 * 60 * 24, // 24 hours (refreshed by cron every 30 min)
  });
}

export async function loadWireCache(): Promise<WireCache | null> {
  const kv = await getKV();
  if (!kv) return null;

  try {
    const raw = await kv.get(KV_KEY_WIRE);
    if (!raw) return null;
    return JSON.parse(raw) as WireCache;
  } catch {
    return null;
  }
}

export async function saveAutoNews(cache: AutoNewsCache): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  await kv.put(KV_KEY_AUTO_NEWS, JSON.stringify(cache), {
    expirationTtl: 60 * 60 * 24, // 24 hours (refreshed by cron every 30 min)
  });
}

export async function loadAutoNews(): Promise<AutoNewsCache | null> {
  const kv = await getKV();
  if (!kv) return null;

  try {
    const raw = await kv.get(KV_KEY_AUTO_NEWS);
    if (!raw) return null;
    return JSON.parse(raw) as AutoNewsCache;
  } catch {
    return null;
  }
}
