import {
  MARKET_INSTRUMENTS,
  type MarketInstrument,
} from "@/lib/data/market-instruments";

export const SITE_NAME = "Trading 100";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://trading100.com";
export const SITE_DESCRIPTION =
  "Live market data, financial news, forecasts, and education for forex, crypto, commodities, indices, and stocks.";

export const NAV_LINKS = [
  { label: "Markets", href: "/markets" },
  { label: "Crypto", href: "/markets/crypto/bitcoin" },
  { label: "Forecasts", href: "/forecasts" },
  { label: "News", href: "/news" },
  { label: "Education", href: "/education" },
  { label: "Tools", href: "/tools/economic-calendar" },
  { label: "About", href: "/about" },
] as const;

export const ASSET_CLASSES = [
  { id: "currencies", label: "Currencies", slug: "currencies" },
  { id: "commodities", label: "Commodities", slug: "commodities" },
  { id: "crypto", label: "Crypto", slug: "crypto" },
  { id: "indices", label: "Indices", slug: "indices" },
  { id: "stocks", label: "Stocks", slug: "stocks" },
  { id: "etfs", label: "ETFs", slug: "etfs" },
] as const;

export type AssetClassId = (typeof ASSET_CLASSES)[number]["id"];

export type { MarketInstrument };

/** @deprecated Use MARKET_INSTRUMENTS from @/lib/data/market-instruments */
export const MARKET_SYMBOLS: Record<
  AssetClassId,
  MarketInstrument[]
> = {
  currencies: [...MARKET_INSTRUMENTS.currencies],
  commodities: [...MARKET_INSTRUMENTS.commodities],
  crypto: [...MARKET_INSTRUMENTS.crypto],
  indices: [...MARKET_INSTRUMENTS.indices],
  stocks: [...MARKET_INSTRUMENTS.stocks],
  etfs: [...MARKET_INSTRUMENTS.etfs],
};

export { MARKET_INSTRUMENTS };

export const TICKER_SYMBOLS = [
  "FX:EURUSD",
  "FX:GBPUSD",
  "FX:USDJPY",
  "FX:AUDUSD",
  "FX:USDCAD",
  "FX:NZDUSD",
  "FX:EURJPY",
  "FX:GBPJPY",
  "TVC:GOLD",
  "TVC:SILVER",
  "TVC:USOIL",
  "TVC:UKOIL",
  "TVC:NATURALGAS",
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "BINANCE:SOLUSDT",
  "BINANCE:XRPUSDT",
  "SP:SPX",
  "NASDAQ:NDX",
  "DJ:DJI",
  "TVC:RUT",
  "NASDAQ:NVDA",
  "NASDAQ:AAPL",
  "AMEX:SPY",
  "NASDAQ:QQQ",
];
