/**
 * Central registry for contextual internal and external (trusted) links.
 * Used by RelatedLinksPanel on every public page.
 */

export type SiteLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type PageLinksBundle = {
  internal: SiteLink[];
  external: SiteLink[];
};

type LinkTopic =
  | "forex"
  | "crypto"
  | "commodities"
  | "indices"
  | "stocks"
  | "education"
  | "tools"
  | "general";

/** Human-readable labels for verified internal paths. */
export const INTERNAL_PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/markets": "Live Markets",
  "/forecasts": "Market Forecasts",
  "/news": "Market News",
  "/education": "Trading Education",
  "/tools/economic-calendar": "Economic Calendar",
  "/tools/currency-converter": "Currency Converter",
  "/about": "About Trading 100",
  "/education/how-to-trade-forex": "How to Trade Forex",
  "/education/how-to-read-rsi": "How to Read RSI",
  "/education/risk-management-for-traders": "Risk Management for Traders",
  "/education/gold-trading-xauusd-beginners-guide": "Gold (XAUUSD) Trading Guide",
  "/education/what-is-xagusd-silver-trading-guide": "Silver (XAGUSD) Trading Guide",
  "/education/what-is-usd-jpy-trading-guide": "USD/JPY Trading Guide",
  "/education/forex-market-sessions-trading-hours-guide": "Forex Market Sessions",
  "/education/forex-vs-stocks-vs-crypto-guide": "Forex vs Stocks vs Crypto",
  "/education/how-to-trade-sp500-index-trading-guide": "S&P 500 Trading Guide",
  "/education/how-to-trade-nasdaq-100-index-guide": "Nasdaq 100 Trading Guide",
  "/education/how-to-trade-brent-crude-oil-guide": "Brent Crude Oil Guide",
  "/education/economic-calendar-forex-trading-guide": "Economic Calendar Guide",
  "/education/cryptocurrency-trading-beginners-guide": "Cryptocurrency Trading Guide",
  "/education/support-and-resistance-trading-guide": "Support & Resistance Guide",
  "/education/moving-average-trading-strategy-guide": "Moving Average Strategy",
  "/forecasts/gold-xauusd-forecast-july-9-2026": "Gold (XAUUSD) Forecast",
  "/forecasts/silver-xagusd-forecast-july-10-2026": "Silver (XAGUSD) Forecast",
  "/forecasts/bitcoin-forecast-july-9-2026": "Bitcoin Forecast",
  "/forecasts/ethereum-forecast-july-10-2026": "Ethereum Forecast",
  "/forecasts/usd-jpy-forecast-july-9-2026": "USD/JPY Forecast",
  "/forecasts/eur-usd-forecast-july-2026": "EUR/USD Forecast",
  "/forecasts/gbp-usd-forecast-july-10-2026": "GBP/USD Forecast",
  "/forecasts/sp500-forecast-july-9-2026": "S&P 500 Forecast",
  "/forecasts/nasdaq-100-forecast-july-10-2026": "Nasdaq 100 Forecast",
  "/forecasts/brent-crude-oil-forecast-july-9-2026": "Brent Crude Oil Forecast",
  "/news/fed-rate-outlook-q2-2026": "Fed Rate Outlook",
  "/news/bitcoin-halving-aftermath-2026": "Bitcoin Halving Analysis",
  "/news/gold-safe-haven-2026": "Gold Safe-Haven Analysis",
};

/** Trusted external authorities by market topic. */
export const EXTERNAL_TRUSTED_SOURCES: Record<LinkTopic, SiteLink[]> = {
  forex: [
    { href: "https://www.bis.org", label: "Bank for International Settlements", external: true },
    { href: "https://www.federalreserve.gov", label: "U.S. Federal Reserve", external: true },
    { href: "https://www.ecb.europa.eu", label: "European Central Bank", external: true },
    { href: "https://www.boj.or.jp/en/", label: "Bank of Japan", external: true },
  ],
  crypto: [
    { href: "https://www.investor.gov", label: "SEC Investor.gov", external: true },
    { href: "https://www.cftc.gov", label: "U.S. Commodity Futures Trading Commission", external: true },
  ],
  commodities: [
    { href: "https://www.cmegroup.com", label: "CME Group", external: true },
    { href: "https://www.ice.com", label: "Intercontinental Exchange (ICE)", external: true },
    { href: "https://www.eia.gov", label: "U.S. Energy Information Administration", external: true },
    { href: "https://www.lbma.org.uk", label: "London Bullion Market Association", external: true },
  ],
  indices: [
    { href: "https://www.spglobal.com/spdji/en/", label: "S&P Dow Jones Indices", external: true },
    { href: "https://indexes.nasdaq.com", label: "Nasdaq Global Indexes", external: true },
    { href: "https://www.cmegroup.com", label: "CME Group", external: true },
  ],
  stocks: [
    { href: "https://www.sec.gov", label: "U.S. Securities and Exchange Commission", external: true },
    { href: "https://www.finra.org", label: "FINRA", external: true },
  ],
  education: [
    { href: "https://www.investor.gov", label: "SEC Investor.gov", external: true },
    { href: "https://www.bis.org", label: "Bank for International Settlements", external: true },
  ],
  tools: [
    { href: "https://www.bis.org/statistics/triennialrep/", label: "BIS Triennial FX Survey", external: true },
    { href: "https://www.federalreserve.gov/releases/h10/", label: "Fed H.10 Exchange Rates", external: true },
  ],
  general: [
    { href: "https://www.bis.org", label: "Bank for International Settlements", external: true },
    { href: "https://www.investor.gov", label: "SEC Investor.gov", external: true },
  ],
};

/** Default internal hubs shown on most pages. */
const HUB_INTERNAL: string[] = [
  "/markets",
  "/forecasts",
  "/news",
  "/education",
  "/tools/economic-calendar",
];

/** Topic-specific internal link sets (paths only). */
const TOPIC_INTERNAL: Record<LinkTopic, string[]> = {
  forex: [
    "/education/how-to-trade-forex",
    "/education/what-is-usd-jpy-trading-guide",
    "/education/forex-market-sessions-trading-hours-guide",
    "/education/economic-calendar-forex-trading-guide",
    "/forecasts/eur-usd-forecast-july-2026",
    "/forecasts/usd-jpy-forecast-july-9-2026",
    "/tools/economic-calendar",
  ],
  crypto: [
    "/education/cryptocurrency-trading-beginners-guide",
    "/forecasts/bitcoin-forecast-july-9-2026",
    "/forecasts/ethereum-forecast-july-10-2026",
    "/news/bitcoin-halving-aftermath-2026",
  ],
  commodities: [
    "/education/gold-trading-xauusd-beginners-guide",
    "/education/what-is-xagusd-silver-trading-guide",
    "/education/how-to-trade-brent-crude-oil-guide",
    "/forecasts/gold-xauusd-forecast-july-9-2026",
    "/forecasts/silver-xagusd-forecast-july-10-2026",
    "/forecasts/brent-crude-oil-forecast-july-9-2026",
  ],
  indices: [
    "/education/how-to-trade-sp500-index-trading-guide",
    "/education/how-to-trade-nasdaq-100-index-guide",
    "/forecasts/sp500-forecast-july-9-2026",
    "/forecasts/nasdaq-100-forecast-july-10-2026",
    "/news/fed-rate-outlook-q2-2026",
  ],
  stocks: [
    "/education/how-to-trade-sp500-index-trading-guide",
    "/news/fed-rate-outlook-q2-2026",
    "/forecasts/sp500-forecast-july-9-2026",
  ],
  education: [
    "/education/risk-management-for-traders",
    "/education/forex-vs-stocks-vs-crypto-guide",
    "/education/support-and-resistance-trading-guide",
    "/markets",
  ],
  tools: [
    "/education/economic-calendar-forex-trading-guide",
    "/education/how-to-trade-forex",
    "/forecasts",
  ],
  general: HUB_INTERNAL,
};

/** Education slug → extra related internal paths. */
const EDUCATION_SLUG_LINKS: Record<string, string[]> = {
  "how-to-trade-forex": ["/forecasts/eur-usd-forecast-july-2026", "/tools/currency-converter"],
  "what-is-usd-jpy-trading-guide": ["/forecasts/usd-jpy-forecast-july-9-2026"],
  "gold-trading-xauusd-beginners-guide": ["/forecasts/gold-xauusd-forecast-july-9-2026", "/news/gold-safe-haven-2026"],
  "what-is-xagusd-silver-trading-guide": ["/forecasts/silver-xagusd-forecast-july-10-2026"],
  "how-to-trade-brent-crude-oil-guide": ["/forecasts/brent-crude-oil-forecast-july-9-2026"],
  "how-to-trade-sp500-index-trading-guide": ["/forecasts/sp500-forecast-july-9-2026"],
  "how-to-trade-nasdaq-100-index-guide": ["/forecasts/nasdaq-100-forecast-july-10-2026"],
  "cryptocurrency-trading-beginners-guide": ["/forecasts/bitcoin-forecast-july-9-2026"],
  "forex-market-sessions-trading-hours-guide": ["/tools/economic-calendar"],
  "economic-calendar-forex-trading-guide": ["/tools/economic-calendar"],
};

/** Symbol/asset-class → internal paths for market instrument pages. */
const INSTRUMENT_LINKS: Record<string, string[]> = {
  "XAUUSD": ["/education/gold-trading-xauusd-beginners-guide", "/forecasts/gold-xauusd-forecast-july-9-2026"],
  "XAGUSD": ["/education/what-is-xagusd-silver-trading-guide", "/forecasts/silver-xagusd-forecast-july-10-2026"],
  "EUR/USD": ["/education/how-to-trade-forex", "/forecasts/eur-usd-forecast-july-2026"],
  "GBP/USD": ["/education/how-to-trade-forex", "/forecasts/gbp-usd-forecast-july-10-2026"],
  "USD/JPY": ["/education/what-is-usd-jpy-trading-guide", "/forecasts/usd-jpy-forecast-july-9-2026"],
  "AUD/USD": ["/education/how-to-trade-forex", "/forecasts/aud-usd-forecast-july-10-2026"],
  "BTC": ["/education/cryptocurrency-trading-beginners-guide", "/forecasts/bitcoin-forecast-july-9-2026"],
  "ETH": ["/education/cryptocurrency-trading-beginners-guide", "/forecasts/ethereum-forecast-july-10-2026"],
  "SPX": ["/education/how-to-trade-sp500-index-trading-guide", "/forecasts/sp500-forecast-july-9-2026"],
  "NDX": ["/education/how-to-trade-nasdaq-100-index-guide", "/forecasts/nasdaq-100-forecast-july-10-2026"],
  "BRENT": ["/education/how-to-trade-brent-crude-oil-guide", "/forecasts/brent-crude-oil-forecast-july-9-2026"],
  "WTI": ["/education/how-to-trade-brent-crude-oil-guide", "/forecasts/brent-crude-oil-forecast-july-9-2026"],
};

function toInternalLink(path: string): SiteLink {
  return {
    href: path,
    label: INTERNAL_PATH_LABELS[path] ?? path.replace(/^\//, "").replace(/-/g, " "),
  };
}

function dedupeLinks(links: SiteLink[], excludeHref?: string): SiteLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (excludeHref && link.href === excludeHref) return false;
    const key = link.external ? `ext:${link.href}` : link.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pathsToInternal(paths: string[], excludeHref?: string, limit = 6): SiteLink[] {
  return dedupeLinks(paths.map(toInternalLink), excludeHref).slice(0, limit);
}

function detectTopicFromSlug(slug: string): LinkTopic {
  const s = slug.toLowerCase();
  if (/gold|xauusd|silver|xagusd|brent|crude|oil|wti/.test(s)) return "commodities";
  if (/bitcoin|btc|ethereum|eth|crypto/.test(s)) return "crypto";
  if (/eur-usd|gbp-usd|usd-jpy|aud-usd|forex|gbpusd/.test(s)) return "forex";
  if (/sp500|nasdaq|ndx|spx|index/.test(s)) return "indices";
  if (/stock|equity|earnings/.test(s)) return "stocks";
  return "general";
}

function detectTopicFromAssetClass(assetClass: string): LinkTopic {
  switch (assetClass) {
    case "currencies":
      return "forex";
    case "crypto":
      return "crypto";
    case "commodities":
      return "commodities";
    case "indices":
      return "indices";
    case "stocks":
      return "stocks";
    default:
      return "general";
  }
}

function symbolFromMarketPath(symbolSlug: string): string {
  const normalized = symbolSlug.replace(/-/g, "/").toUpperCase();
  if (normalized.includes("/")) return normalized;
  if (/^(BTC|ETH|XAUUSD|XAGUSD|SPX|NDX|BRENT|WTI)/i.test(normalized)) return normalized;
  if (normalized.length <= 5) return normalized;
  return normalized;
}

function externalForTopic(topic: LinkTopic, limit = 3): SiteLink[] {
  return EXTERNAL_TRUSTED_SOURCES[topic].slice(0, limit);
}

/**
 * Resolve contextual internal + external links for any public pathname.
 */
export function getLinksForPath(pathname: string): PageLinksBundle {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";
  const segments = path.split("/").filter(Boolean);

  let internalPaths: string[] = [...HUB_INTERNAL];
  let topic: LinkTopic = "general";

  if (path === "/") {
    topic = "general";
    internalPaths = [
      "/markets",
      "/forecasts",
      "/education/how-to-trade-forex",
      "/education/risk-management-for-traders",
      "/tools/economic-calendar",
    ];
  } else if (segments[0] === "education" && segments[1]) {
    topic = "education";
    const slug = segments[1];
    internalPaths = [
      "/education",
      ...(EDUCATION_SLUG_LINKS[slug] ?? []),
      ...TOPIC_INTERNAL.education,
    ];
    const slugTopic = detectTopicFromSlug(slug);
    if (slugTopic !== "general") {
      internalPaths = [...internalPaths, ...TOPIC_INTERNAL[slugTopic]];
      topic = slugTopic;
    }
  } else if (segments[0] === "forecasts" && segments[1]) {
    topic = detectTopicFromSlug(segments[1]);
    internalPaths = [
      "/forecasts",
      ...TOPIC_INTERNAL[topic],
      "/education/risk-management-for-traders",
    ];
  } else if (segments[0] === "news" && segments[1]) {
    topic = detectTopicFromSlug(segments[1]);
    internalPaths = ["/news", ...TOPIC_INTERNAL[topic]];
  } else if (segments[0] === "news") {
    topic = "general";
    internalPaths = ["/forecasts", "/education", ...HUB_INTERNAL];
  } else if (segments[0] === "forecasts") {
    topic = "general";
    internalPaths = ["/news", "/education", ...HUB_INTERNAL];
  } else if (segments[0] === "education") {
    topic = "education";
    internalPaths = ["/markets", "/forecasts", ...TOPIC_INTERNAL.education];
  } else if (segments[0] === "markets" && segments[1] && segments[2]) {
    const assetClass = segments[1];
    topic = detectTopicFromAssetClass(assetClass);
    const symbol = symbolFromMarketPath(segments[2]);
    const instrumentPaths =
      INSTRUMENT_LINKS[symbol] ??
      INSTRUMENT_LINKS[symbol.replace("/", "")] ??
      TOPIC_INTERNAL[topic];
    internalPaths = [
      "/markets",
      ...instrumentPaths,
      ...TOPIC_INTERNAL[topic],
      "/tools/economic-calendar",
    ];
  } else if (segments[0] === "markets") {
    topic = "general";
    internalPaths = ["/forecasts", "/education", "/tools/currency-converter", ...HUB_INTERNAL];
  } else if (segments[0] === "tools") {
    topic = "tools";
    if (segments[1] === "economic-calendar") {
      internalPaths = TOPIC_INTERNAL.tools;
    } else if (segments[1] === "currency-converter") {
      internalPaths = [
        "/education/how-to-trade-forex",
        "/education/forex-position-sizing-lot-size-guide",
        "/forecasts/eur-usd-forecast-july-2026",
        "/markets",
      ];
      topic = "forex";
    } else {
      internalPaths = TOPIC_INTERNAL.tools;
    }
  } else if (["about", "contact", "disclaimer", "privacy-policy", "terms"].includes(segments[0])) {
    topic = "general";
    internalPaths = [
      "/education",
      "/education/risk-management-for-traders",
      "/disclaimer",
      ...HUB_INTERNAL,
    ];
  }

  const currentPath = path === "/" ? "/" : path;
  return {
    internal: pathsToInternal(internalPaths, currentPath, 6),
    external: externalForTopic(topic, 3),
  };
}
