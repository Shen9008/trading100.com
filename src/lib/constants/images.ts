import type { ArticleCategory } from "@/lib/data/articles";

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=800&q=80`;

/** Verified Unsplash URLs — broken legacy IDs are remapped in resolveImageUrl. */
export const STOCK_IMAGES = {
  default: unsplash("photo-1611974789855-9c2a0a7236a3"),
  forex: unsplash("photo-1611974789855-9c2a0a7236a3"),
  forexPairs: unsplash("photo-1526304640581-d334cdbbf45e"),
  crypto: unsplash("photo-1605792657660-596af9009e82"),
  commodities: unsplash("photo-1578662996442-48f60103fc96"),
  gold: unsplash("photo-1579621970563-ebec7560ff3e"),
  stocks: unsplash("photo-1590283603385-17ffb3a7f29f"),
  indices: unsplash("photo-1642790106117-e829e14a795f"),
  education: unsplash("photo-1642790106117-e829e14a795f"),
  risk: unsplash("photo-1551288049-bebda4e38f71"),
  forecast: unsplash("photo-1611974789855-9c2a0a7236a3"),
} as const;

const LEGACY_BROKEN_IDS: Record<string, string> = {
  "photo-1610375461244-0c3f1a0a5c0e": STOCK_IMAGES.gold,
  "photo-1518546304927-5b4aa41e7635": STOCK_IMAGES.crypto,
  "photo-1621761190629-d097e49d8b47": STOCK_IMAGES.crypto,
  "photo-1559526324-4b87b75e44e6": STOCK_IMAGES.risk,
};

export function getCategoryImage(
  category?: ArticleCategory | string
): string {
  switch (category) {
    case "crypto":
      return STOCK_IMAGES.crypto;
    case "forex":
      return STOCK_IMAGES.forex;
    case "commodities":
      return STOCK_IMAGES.commodities;
    case "indices":
      return STOCK_IMAGES.indices;
    case "stocks":
      return STOCK_IMAGES.stocks;
    case "education":
      return STOCK_IMAGES.education;
    case "forecast":
      return STOCK_IMAGES.forecast;
    default:
      return STOCK_IMAGES.default;
  }
}

export function resolveImageUrl(
  url: string | undefined | null,
  category?: ArticleCategory | string
): string {
  if (!url?.trim()) return getCategoryImage(category);

  for (const [brokenId, replacement] of Object.entries(LEGACY_BROKEN_IDS)) {
    if (url.includes(brokenId)) return replacement;
  }

  return url;
}

export const OPTIMIZED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "assets.coingecko.com",
  "static2.finnhub.io",
]);

export function isOptimizedImageHost(src: string): boolean {
  try {
    return OPTIMIZED_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
