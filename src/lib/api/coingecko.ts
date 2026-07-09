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
