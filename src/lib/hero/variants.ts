import { STOCK_IMAGES } from "@/lib/constants/images";
import type { AssetClassId } from "@/lib/constants";

export type HeroVariant =
  | "markets"
  | "news"
  | "forecasts"
  | "education"
  | "about"
  | "contact"
  | "calendar"
  | "converter"
  | "legal"
  | "crypto"
  | "forex"
  | "commodities"
  | "stocks"
  | "indices"
  | "etfs"
  | "default";

export type HeroVariantConfig = {
  image: string;
  accentFrom: string;
  accentTo: string;
  graphic: HeroVariant;
};

const VARIANT_CONFIG: Record<HeroVariant, HeroVariantConfig> = {
  markets: {
    image: STOCK_IMAGES.forex,
    accentFrom: "hsl(42 62% 58% / 0.35)",
    accentTo: "hsl(168 45% 46% / 0.2)",
    graphic: "markets",
  },
  news: {
    image: STOCK_IMAGES.stocks,
    accentFrom: "hsl(210 70% 55% / 0.3)",
    accentTo: "hsl(42 62% 58% / 0.25)",
    graphic: "news",
  },
  forecasts: {
    image: STOCK_IMAGES.forecast,
    accentFrom: "hsl(168 45% 46% / 0.35)",
    accentTo: "hsl(42 62% 58% / 0.2)",
    graphic: "forecasts",
  },
  education: {
    image: STOCK_IMAGES.education,
    accentFrom: "hsl(260 50% 55% / 0.25)",
    accentTo: "hsl(42 62% 58% / 0.3)",
    graphic: "education",
  },
  about: {
    image: STOCK_IMAGES.indices,
    accentFrom: "hsl(42 62% 58% / 0.3)",
    accentTo: "hsl(200 60% 50% / 0.2)",
    graphic: "about",
  },
  contact: {
    image: STOCK_IMAGES.forexPairs,
    accentFrom: "hsl(168 45% 46% / 0.3)",
    accentTo: "hsl(42 62% 58% / 0.2)",
    graphic: "contact",
  },
  calendar: {
    image: STOCK_IMAGES.forex,
    accentFrom: "hsl(15 70% 55% / 0.3)",
    accentTo: "hsl(42 62% 58% / 0.25)",
    graphic: "calendar",
  },
  converter: {
    image: STOCK_IMAGES.forexPairs,
    accentFrom: "hsl(200 65% 55% / 0.3)",
    accentTo: "hsl(168 45% 46% / 0.25)",
    graphic: "converter",
  },
  legal: {
    image: STOCK_IMAGES.risk,
    accentFrom: "hsl(42 40% 50% / 0.2)",
    accentTo: "hsl(220 30% 40% / 0.15)",
    graphic: "legal",
  },
  crypto: {
    image: STOCK_IMAGES.crypto,
    accentFrom: "hsl(270 60% 55% / 0.35)",
    accentTo: "hsl(42 62% 58% / 0.2)",
    graphic: "crypto",
  },
  forex: {
    image: STOCK_IMAGES.forexPairs,
    accentFrom: "hsl(168 45% 46% / 0.35)",
    accentTo: "hsl(42 62% 58% / 0.25)",
    graphic: "forex",
  },
  commodities: {
    image: STOCK_IMAGES.gold,
    accentFrom: "hsl(42 70% 50% / 0.4)",
    accentTo: "hsl(25 60% 45% / 0.2)",
    graphic: "commodities",
  },
  stocks: {
    image: STOCK_IMAGES.stocks,
    accentFrom: "hsl(210 65% 55% / 0.3)",
    accentTo: "hsl(168 45% 46% / 0.2)",
    graphic: "stocks",
  },
  indices: {
    image: STOCK_IMAGES.indices,
    accentFrom: "hsl(200 55% 50% / 0.3)",
    accentTo: "hsl(42 62% 58% / 0.2)",
    graphic: "indices",
  },
  etfs: {
    image: STOCK_IMAGES.indices,
    accentFrom: "hsl(168 50% 48% / 0.3)",
    accentTo: "hsl(210 55% 50% / 0.2)",
    graphic: "etfs",
  },
  default: {
    image: STOCK_IMAGES.default,
    accentFrom: "hsl(42 62% 58% / 0.3)",
    accentTo: "hsl(168 45% 46% / 0.2)",
    graphic: "default",
  },
};

export function getHeroVariant(variant: HeroVariant = "default"): HeroVariantConfig {
  return VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.default;
}

export function assetClassToHeroVariant(
  assetClassId: AssetClassId
): HeroVariant {
  const map: Record<AssetClassId, HeroVariant> = {
    currencies: "forex",
    commodities: "commodities",
    crypto: "crypto",
    indices: "indices",
    stocks: "stocks",
    etfs: "etfs",
  };
  return map[assetClassId] ?? "markets";
}
