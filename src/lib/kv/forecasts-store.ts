import type { Article } from "@/lib/data/articles";

const KV_KEY_LATEST = "forecasts:latest";
const KV_KEY_WIRE = "news:wire-cache";
const KV_KEY_AUTO_NEWS = "news:auto-posts";

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

export async function saveDailyForecasts(forecasts: Article[]): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  const payload = {
    generatedAt: new Date().toISOString(),
    forecasts,
  };

  await kv.put(KV_KEY_LATEST, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 48, // 48 hours
  });
}

export async function loadDailyForecasts(): Promise<Article[]> {
  const kv = await getKV();
  if (!kv) return [];

  try {
    const raw = await kv.get(KV_KEY_LATEST);
    if (!raw) return [];
    const data = JSON.parse(raw) as { forecasts: Article[] };
    return data.forecasts ?? [];
  } catch {
    return [];
  }
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
