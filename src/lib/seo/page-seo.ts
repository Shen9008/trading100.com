import { BRAND_OG_DEFAULT } from "@/lib/constants/brand";
import { STOCK_IMAGES } from "@/lib/constants/images";
import type { AssetClassId } from "@/lib/constants";
import type { ArticleCategory } from "@/lib/data/articles";

export const DEFAULT_OG_IMAGE = BRAND_OG_DEFAULT;

export const HOME_KEYWORDS = [
  "live market data",
  "forex rates",
  "crypto prices",
  "stock market news",
  "trading education",
  "economic calendar",
  "currency converter",
  "market forecasts",
];

export const MARKETS_KEYWORDS = [
  "forex pairs",
  "cryptocurrency prices",
  "stock quotes",
  "commodity prices",
  "market indices",
  "ETF prices",
  "live charts",
  "TradingView",
];

export const NEWS_KEYWORDS = [
  "financial news",
  "forex news",
  "crypto news",
  "stock market news",
  "commodity news",
  "business news",
  "economy news",
];

export const FORECASTS_KEYWORDS = [
  "market forecast",
  "forex forecast",
  "bitcoin forecast",
  "gold price forecast",
  "stock market outlook",
  "technical analysis",
];

export const EDUCATION_KEYWORDS = [
  "trading education",
  "forex trading guide",
  "technical analysis tutorial",
  "risk management trading",
  "learn to trade",
];

export const TOOLS_CALENDAR_KEYWORDS = [
  "economic calendar",
  "forex calendar",
  "NFP release date",
  "CPI data release",
  "central bank meetings",
  "high impact news",
];

export const TOOLS_CONVERTER_KEYWORDS = [
  "currency converter",
  "exchange rate calculator",
  "forex converter",
  "ECB exchange rates",
  "USD to EUR",
  "currency exchange",
];

export const ABOUT_KEYWORDS = [
  "Trading 100",
  "financial markets platform",
  "trading news",
  "market analysis",
  "trading education",
];

export const CONTACT_KEYWORDS = [
  "contact Trading 100",
  "editorial team",
  "partnership inquiry",
  "market news contact",
];

const ASSET_CLASS_KEYWORDS: Record<AssetClassId, string[]> = {
  currencies: ["forex", "currency pair", "exchange rate", "FX trading", "pip value"],
  commodities: ["gold price", "oil price", "commodity trading", "XAU USD", "crude oil"],
  crypto: ["cryptocurrency", "bitcoin price", "ethereum", "crypto chart", "altcoins"],
  indices: ["stock index", "S&P 500", "Nasdaq", "Dow Jones", "index trading"],
  stocks: ["stock price", "equity markets", "share price", "US stocks", "earnings"],
  etfs: ["ETF price", "exchange traded fund", "SPY", "QQQ", "sector ETF"],
};

const ASSET_CLASS_OG: Record<AssetClassId, string> = {
  currencies: STOCK_IMAGES.forex,
  commodities: STOCK_IMAGES.commodities,
  crypto: STOCK_IMAGES.crypto,
  indices: STOCK_IMAGES.indices,
  stocks: STOCK_IMAGES.stocks,
  etfs: STOCK_IMAGES.indices,
};

const CATEGORY_KEYWORDS: Record<ArticleCategory, string[]> = {
  forex: ["forex news", "currency markets", "central bank", "EUR USD", "USD JPY"],
  crypto: ["bitcoin news", "cryptocurrency", "blockchain", "ethereum", "crypto market"],
  commodities: ["gold news", "oil prices", "commodities", "silver", "natural gas"],
  indices: ["S&P 500 news", "Nasdaq", "stock index", "market rally"],
  stocks: ["stock news", "earnings", "equities", "Wall Street", "IPO"],
  forecast: ["market forecast", "price outlook", "technical analysis", "trading outlook"],
  education: ["trading guide", "learn trading", "trading tutorial"],
};

const FORECAST_FILTER_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  all: {
    title: "Market Forecasts & Price Outlooks",
    description:
      "Daily market forecasts for forex, crypto, gold, indices, and stocks. Expert price outlooks with base, bull, and bear scenarios.",
    keywords: FORECASTS_KEYWORDS,
  },
  forex: {
    title: "Forex Forecasts — EUR/USD, GBP/USD, USD/JPY Outlook",
    description:
      "Currency pair forecasts and FX outlooks. Track EUR/USD, GBP/USD, USD/JPY and major forex levels with daily analysis.",
    keywords: ["forex forecast", "EUR USD outlook", "GBP USD forecast", "USD JPY analysis"],
  },
  crypto: {
    title: "Crypto Forecasts — Bitcoin & Ethereum Price Outlook",
    description:
      "Cryptocurrency price forecasts for Bitcoin, Ethereum, and major altcoins. Daily crypto market outlook and key levels.",
    keywords: ["bitcoin forecast", "ethereum outlook", "crypto price prediction", "BTC analysis"],
  },
  commodities: {
    title: "Commodity Forecasts — Gold, Oil & Silver Outlook",
    description:
      "Commodity market forecasts covering gold (XAU/USD), crude oil, silver, and energy. Daily price outlook and scenario analysis.",
    keywords: ["gold forecast", "oil price outlook", "XAU USD", "commodity trading forecast"],
  },
  indices: {
    title: "Index Forecasts — S&P 500, Nasdaq & Dow Outlook",
    description:
      "Stock index forecasts for S&P 500, Nasdaq 100, Dow Jones, and global indices. Daily market outlook and key levels.",
    keywords: ["S&P 500 forecast", "Nasdaq outlook", "index trading forecast", "stock market prediction"],
  },
  stocks: {
    title: "Stock Forecasts — Equity Market Outlook",
    description:
      "Individual stock and equity market forecasts. Daily outlook on mega-cap tech, sectors, and US equities.",
    keywords: ["stock forecast", "equity outlook", "earnings forecast", "stock market analysis"],
  },
};

const EDUCATION_SLUG_KEYWORDS: Record<string, string[]> = {
  "how-to-trade-forex": ["how to trade forex", "forex for beginners", "currency trading", "pip value", "leverage forex"],
  "how-to-read-rsi": ["RSI indicator", "relative strength index", "overbought oversold", "momentum indicator"],
  "understanding-candlestick-patterns": ["candlestick patterns", "price action", "doji hammer engulfing", "Japanese candlesticks"],
  "risk-management-for-traders": ["risk management trading", "position sizing", "stop loss", "drawdown", "1 percent rule"],
  "moving-average-trading-strategy-guide": ["moving average strategy", "EMA crossover", "SMA trading", "golden cross"],
  "support-and-resistance-trading-guide": ["support and resistance", "key levels trading", "price levels", "breakout trading"],
  "macd-indicator-trading-guide": ["MACD indicator", "MACD crossover", "MACD histogram", "momentum trading"],
  "gold-trading-xauusd-beginners-guide": ["gold trading", "XAU USD", "trade gold online", "gold price analysis"],
  "day-trading-vs-swing-trading-guide": ["day trading vs swing trading", "intraday trading", "swing trading strategy"],
  "economic-calendar-forex-trading-guide": ["economic calendar trading", "NFP forex", "CPI trading", "forex news events"],
  "fibonacci-retracement-trading-guide": ["fibonacci retracement", "fibonacci trading", "fib levels", "golden ratio trading"],
  "cryptocurrency-trading-beginners-guide": ["cryptocurrency trading", "how to trade bitcoin", "crypto for beginners"],
  "forex-position-sizing-lot-size-guide": ["forex position sizing", "lot size calculator", "pip value calculator", "margin forex"],
  "trading-psychology-discipline-guide": ["trading psychology", "emotional trading", "trading discipline", "fear and greed"],
  "how-to-trade-sp500-index-trading-guide": ["how to trade the S&P 500", "S&P 500 trading for beginners", "SPX index explained", "E-mini S&P 500 futures", "US stock index trading"],
};

export function getInstrumentSeo(
  name: string,
  symbol: string,
  assetClassId: AssetClassId,
  assetClassLabel: string
) {
  const keywords = [
    `${symbol} price`,
    `${name} chart`,
    `live ${symbol}`,
    ...ASSET_CLASS_KEYWORDS[assetClassId],
  ];

  return {
    title: `${symbol} Price Live — ${name} Chart & Market Data`,
    description: `Live ${name} (${symbol}) price, interactive TradingView chart, and ${assetClassLabel.toLowerCase()} market context. Track ${symbol} with real-time data, related news, and forecasts on Trading 100.`,
    keywords,
    ogImage: ASSET_CLASS_OG[assetClassId],
  };
}

export function getArticleKeywords(category: ArticleCategory, title: string): string[] {
  const base = CATEGORY_KEYWORDS[category] ?? NEWS_KEYWORDS;
  const fromTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4);
  return Array.from(new Set([...base, ...fromTitle]));
}

export function getEducationKeywords(slug: string): string[] {
  return EDUCATION_SLUG_KEYWORDS[slug] ?? EDUCATION_KEYWORDS;
}

export function getForecastFilterSeo(filter?: string) {
  return FORECAST_FILTER_SEO[filter ?? "all"] ?? FORECAST_FILTER_SEO.all;
}

export function getNewsCategorySeo(category?: string) {
  if (!category) {
    return {
      title: "Financial News — Forex, Crypto, Stocks & Markets",
      description:
        "Latest financial news on forex, cryptocurrency, commodities, stocks, and global markets. Auto-updated headlines and original analysis.",
      keywords: NEWS_KEYWORDS,
      path: "/news",
    };
  }
  const map: Record<string, { title: string; description: string; keywords: string[] }> = {
    forex: {
      title: "Forex News — Currency & Central Bank Headlines",
      description: "Latest forex news covering major currency pairs, central bank decisions, and FX market moves.",
      keywords: CATEGORY_KEYWORDS.forex,
    },
    crypto: {
      title: "Crypto News — Bitcoin, Ethereum & Altcoin Headlines",
      description: "Cryptocurrency news and market updates for Bitcoin, Ethereum, and the digital asset space.",
      keywords: CATEGORY_KEYWORDS.crypto,
    },
    stocks: {
      title: "Stock Market News — Equities & Earnings",
      description: "Stock market news, earnings reports, and equity market headlines from global exchanges.",
      keywords: CATEGORY_KEYWORDS.stocks,
    },
    commodities: {
      title: "Commodity News — Gold, Oil & Metals",
      description: "Commodity market news covering gold, crude oil, silver, and agricultural markets.",
      keywords: CATEGORY_KEYWORDS.commodities,
    },
  };
  const cfg = map[category] ?? {
    title: `${category.charAt(0).toUpperCase()}${category.slice(1)} News`,
    description: `Latest ${category} news and market headlines.`,
    keywords: NEWS_KEYWORDS,
  };
  return { ...cfg, path: `/news?category=${category}` };
}
