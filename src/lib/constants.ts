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

export const MARKET_SYMBOLS: Record<
  AssetClassId,
  { symbol: string; name: string; tvSymbol: string }[]
> = {
  currencies: [
    { symbol: "EUR/USD", name: "Euro / US Dollar", tvSymbol: "FX:EURUSD" },
    { symbol: "GBP/USD", name: "British Pound / US Dollar", tvSymbol: "FX:GBPUSD" },
    { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", tvSymbol: "FX:USDJPY" },
    { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", tvSymbol: "FX:AUDUSD" },
    { symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", tvSymbol: "FX:USDCAD" },
    { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", tvSymbol: "FX:USDCHF" },
    { symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", tvSymbol: "FX:NZDUSD" },
    { symbol: "EUR/GBP", name: "Euro / British Pound", tvSymbol: "FX:EURGBP" },
  ],
  commodities: [
    { symbol: "XAU/USD", name: "Gold", tvSymbol: "TVC:GOLD" },
    { symbol: "XAG/USD", name: "Silver", tvSymbol: "TVC:SILVER" },
    { symbol: "WTI", name: "Crude Oil WTI", tvSymbol: "TVC:USOIL" },
    { symbol: "BRENT", name: "Brent Crude Oil", tvSymbol: "TVC:UKOIL" },
    { symbol: "NGAS", name: "Natural Gas", tvSymbol: "TVC:NATURALGAS" },
    { symbol: "COPPER", name: "Copper", tvSymbol: "TVC:COPPER" },
  ],
  crypto: [
    { symbol: "BTC", name: "Bitcoin", tvSymbol: "BINANCE:BTCUSDT" },
    { symbol: "ETH", name: "Ethereum", tvSymbol: "BINANCE:ETHUSDT" },
    { symbol: "SOL", name: "Solana", tvSymbol: "BINANCE:SOLUSDT" },
    { symbol: "XRP", name: "XRP", tvSymbol: "BINANCE:XRPUSDT" },
    { symbol: "BNB", name: "BNB", tvSymbol: "BINANCE:BNBUSDT" },
    { symbol: "ADA", name: "Cardano", tvSymbol: "BINANCE:ADAUSDT" },
  ],
  indices: [
    { symbol: "SPX", name: "S&P 500", tvSymbol: "SP:SPX" },
    { symbol: "NDX", name: "Nasdaq 100", tvSymbol: "NASDAQ:NDX" },
    { symbol: "DJI", name: "Dow Jones", tvSymbol: "DJ:DJI" },
    { symbol: "DAX", name: "DAX 40", tvSymbol: "XETR:DAX" },
    { symbol: "FTSE", name: "FTSE 100", tvSymbol: "TVC:UKX" },
    { symbol: "NI225", name: "Nikkei 225", tvSymbol: "TVC:NI225" },
  ],
  stocks: [
    { symbol: "AAPL", name: "Apple", tvSymbol: "NASDAQ:AAPL" },
    { symbol: "MSFT", name: "Microsoft", tvSymbol: "NASDAQ:MSFT" },
    { symbol: "GOOGL", name: "Alphabet", tvSymbol: "NASDAQ:GOOGL" },
    { symbol: "AMZN", name: "Amazon", tvSymbol: "NASDAQ:AMZN" },
    { symbol: "NVDA", name: "NVIDIA", tvSymbol: "NASDAQ:NVDA" },
    { symbol: "TSLA", name: "Tesla", tvSymbol: "NASDAQ:TSLA" },
  ],
  etfs: [
    { symbol: "SPY", name: "SPDR S&P 500 ETF", tvSymbol: "AMEX:SPY" },
    { symbol: "QQQ", name: "Invesco QQQ", tvSymbol: "NASDAQ:QQQ" },
    { symbol: "IWM", name: "iShares Russell 2000", tvSymbol: "AMEX:IWM" },
    { symbol: "GLD", name: "SPDR Gold Shares", tvSymbol: "AMEX:GLD" },
    { symbol: "TLT", name: "iShares 20+ Year Treasury", tvSymbol: "NASDAQ:TLT" },
    { symbol: "VWO", name: "Vanguard FTSE Emerging Markets", tvSymbol: "AMEX:VWO" },
  ],
};

export const TICKER_SYMBOLS = [
  "FX:EURUSD",
  "FX:GBPUSD",
  "FX:USDJPY",
  "TVC:GOLD",
  "TVC:USOIL",
  "BINANCE:BTCUSDT",
  "BINANCE:ETHUSDT",
  "SP:SPX",
  "NASDAQ:NDX",
  "DJ:DJI",
  "NASDAQ:AAPL",
  "NASDAQ:NVDA",
  "FX:AUDUSD",
  "TVC:SILVER",
  "BINANCE:SOLUSDT",
];
