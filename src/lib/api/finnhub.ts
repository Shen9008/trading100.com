export type FinnhubNewsItem = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

export type FinnhubQuote = {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

export async function fetchFinnhubNews(
  category: "general" | "forex" | "crypto" | "merger" = "general"
): Promise<FinnhubNewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) return [];
  return res.json();
}

export async function fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
    { next: { revalidate: 60 } }
  );

  if (!res.ok) return null;
  return res.json();
}

export async function fetchStockQuotes(
  symbols: string[]
): Promise<(FinnhubQuote & { symbol: string })[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const quote = await fetchFinnhubQuote(symbol);
      return quote ? { ...quote, symbol } : null;
    })
  );
  return results.filter(Boolean) as (FinnhubQuote & { symbol: string })[];
}
