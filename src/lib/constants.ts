import {
  MARKET_INSTRUMENTS,
  type MarketInstrument,
} from "@/lib/data/market-instruments";

export const SITE_NAME = "Trading 100";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://trading100.com";
export const SITE_DESCRIPTION =
  "Trading 100 delivers live forex, crypto, gold, and stock market data with daily forecasts, financial news, and free trading education.";

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

/** Comma-separated symbols for the global TradingView ticker tape web component. */
export const TICKER_TAPE_SYMBOLS =
  "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,OANDA:XAUUSD,VANTAGE:DJ30,OANDA:GBPUSD,FX:USDJPY,OANDA:AUDUSD,TVC:DXY,TVC:NI225,KRX:KOSPI,NASDAQ:NVDA,NASDAQ:SPCX,NASDAQ:MU,NASDAQ:MSFT,NASDAQ:META,NASDAQ:NFLX,NASDAQ:GOOGL,NASDAQ:AVGO,OANDA:USDCAD";

/** Symbols for the TradingView tv-tickers widget on forecast pages. */
export const FORECAST_TICKERS_SYMBOLS =
  "FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,TVC:USOIL,OANDA:USDCAD,TVC:UKOIL,OANDA:GBPUSD,OANDA:AUDUSD,FX:USDJPY,BLACKBULL:US30,PEPPERSTONE:HK50,OANDA:JP225USD,CAPITALCOM:DXY";
