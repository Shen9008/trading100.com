export type RssFeedItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
};

export type RssFeedConfig = {
  url: string;
  source: string;
  topics: ("stocks" | "commodities" | "forex" | "economy" | "business" | "finance")[];
};

/** Free RSS feeds covering stocks, commodities, currencies, economy, business, finance. */
export const FINANCE_RSS_FEEDS: RssFeedConfig[] = [
  {
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    source: "BBC Business",
    topics: ["business", "economy", "finance"],
  },
  {
    url: "https://feeds.bbci.co.uk/news/economy/rss.xml",
    source: "BBC Economy",
    topics: ["economy", "finance"],
  },
  {
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    source: "CNBC Top News",
    topics: ["stocks", "business", "finance"],
  },
  {
    url: "https://www.cnbc.com/id/20910258/device/rss/rss.html",
    source: "CNBC Economy",
    topics: ["economy", "finance"],
  },
  {
    url: "https://www.cnbc.com/id/10000664/device/rss/rss.html",
    source: "CNBC Finance",
    topics: ["finance", "stocks"],
  },
  {
    url: "https://finance.yahoo.com/news/rssindex",
    source: "Yahoo Finance",
    topics: ["stocks", "business", "finance"],
  },
  {
    url: "https://www.investing.com/rss/news_25.rss",
    source: "Investing.com Forex",
    topics: ["forex"],
  },
  {
    url: "https://www.investing.com/rss/news_301.rss",
    source: "Investing.com Commodities",
    topics: ["commodities"],
  },
];

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? decodeXml(m[1]) : "";
}

function parseRssXml(xml: string, source: string): RssFeedItem[] {
  const items: RssFeedItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const block of itemBlocks) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const description =
      extractTag(block, "description") || extractTag(block, "summary");
    const pubDate =
      extractTag(block, "pubDate") || extractTag(block, "published");

    if (!title || !link) continue;

    items.push({ title, link, description, pubDate, source });
  }

  return items;
}

export async function fetchRssFeed(
  config: RssFeedConfig
): Promise<RssFeedItem[]> {
  try {
    const res = await fetch(config.url, {
      headers: { "User-Agent": "Trading100-NewsBot/1.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssXml(xml, config.source);
  } catch {
    return [];
  }
}

export async function fetchAllRssItems(limit = 50): Promise<RssFeedItem[]> {
  const batches = await Promise.all(
    FINANCE_RSS_FEEDS.map((feed) => fetchRssFeed(feed))
  );

  const seen = new Set<string>();
  const merged: RssFeedItem[] = [];

  for (const batch of batches) {
    for (const item of batch) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      merged.push(item);
    }
  }

  return merged.slice(0, limit);
}
