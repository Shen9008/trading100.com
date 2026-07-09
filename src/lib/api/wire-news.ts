import { fetchFinnhubNews, type FinnhubNewsItem } from "./finnhub";
import { loadWireCache, saveWireCache } from "@/lib/kv/forecasts-store";

export async function getWireHeadlines(
  limit = 15
): Promise<FinnhubNewsItem[]> {
  const cached = await loadWireCache();
  if (cached?.items?.length) {
    return cached.items.slice(0, limit).map((item) => ({
      ...item,
      category: "general",
      image: "",
      related: "",
    }));
  }

  const fresh = await fetchFinnhubNews("general");
  if (fresh.length > 0) {
    await saveWireCache({
      fetchedAt: new Date().toISOString(),
      items: fresh.slice(0, 20).map((item) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime,
      })),
    });
  }

  return fresh.slice(0, limit);
}
