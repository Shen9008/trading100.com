export type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  sparkline_in_7d?: { price: number[] };
};

export async function fetchCryptoMarkets(): Promise<CoinGeckoMarket[]> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h",
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchCoinGeckoDailyBars(
  coinId: "bitcoin" | "ethereum",
  days = 30
): Promise<
  { date: string; open: number; high: number; low: number; close: number }[]
> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];

    const json = (await res.json()) as {
      prices?: [number, number][];
    };
    const prices = json.prices ?? [];
    if (prices.length < 5) return [];

    const bars: {
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
    }[] = [];

    for (let i = 0; i < prices.length; i++) {
      const [ts, close] = prices[i];
      const prevClose = i > 0 ? prices[i - 1][1] : close;
      const nextClose = i < prices.length - 1 ? prices[i + 1][1] : close;
      const high = Math.max(prevClose, close, nextClose);
      const low = Math.min(prevClose, close, nextClose);
      bars.push({
        date: new Date(ts).toISOString().slice(0, 10),
        open: prevClose,
        high,
        low,
        close,
      });
    }

    return bars;
  } catch {
    return [];
  }
}
