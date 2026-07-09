import type { Article } from "@/lib/data/articles";

const KV_KEY_LATEST = "forecasts:latest";
const KV_KEY_WIRE = "news:wire-cache";

export type WireCache = {
  fetchedAt: string;
  items: {
    id: number;
    headline: string;
    summary: string;
    source: string;
    url: string;
    datetime: number;
  }[];
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
    expirationTtl: 600, // 10 min
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
