import type { MetadataRoute } from "next";
import { SITE_URL, ASSET_CLASSES } from "@/lib/constants";
import { MARKET_INSTRUMENTS } from "@/lib/data/market-instruments";
import { ORIGINAL_ARTICLES } from "@/lib/data/articles";
import { FORECAST_ARTICLES } from "@/lib/data/forecasts";
import { getEducationGuides } from "@/lib/data/education";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/markets",
    "/news",
    "/forecasts",
    "/education",
    "/tools/economic-calendar",
    "/tools/currency-converter",
    "/about",
    "/contact",
    "/disclaimer",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const marketPages = ASSET_CLASSES.flatMap((ac) =>
    MARKET_INSTRUMENTS[ac.id].map((item) => {
      const slug =
        item.slug ?? item.symbol.toLowerCase().replace("/", "-");
      return {
        url: `${SITE_URL}/markets/${ac.slug}/${slug}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.7,
      };
    })
  );

  const articlePages = [...ORIGINAL_ARTICLES, ...FORECAST_ARTICLES].map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const educationPages = getEducationGuides().map((g) => ({
    url: `${SITE_URL}/education/${g.slug}`,
    lastModified: new Date(g.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...marketPages, ...articlePages, ...educationPages];
}
