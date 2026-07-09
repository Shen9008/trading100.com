export type MarketauxEntity = {
  symbol: string;
  name: string;
  type: string;
  industry?: string;
  country?: string;
  sentiment_score?: number;
};

export type MarketauxArticle = {
  uuid: string;
  title: string;
  description: string;
  snippet: string;
  url: string;
  image_url: string | null;
  language: string;
  published_at: string;
  source: string;
  entities: MarketauxEntity[];
};

type MarketauxResponse = {
  meta: { found: number; returned: number; limit: number; page: number };
  data: MarketauxArticle[];
};

export async function fetchMarketauxNews(
  limit = 20
): Promise<MarketauxArticle[]> {
  const apiKey = process.env.MARKETAUX_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    api_token: apiKey,
    language: "en",
    filter_entities: "true",
    limit: String(Math.min(limit, 50)),
  });

  const res = await fetch(
    `https://api.marketaux.com/v1/news/all?${params.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) return [];

  const json = (await res.json()) as MarketauxResponse;
  return json.data ?? [];
}
