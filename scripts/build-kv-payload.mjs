#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMdxFile } from "./mdx-frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRAFTS_DIR = path.join(ROOT, "content/drafts/forecasts");

const STOCK_IMAGES = {
  forex: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  crypto: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80",
  commodities: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  indices: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
  forecast: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
};

function getCategoryImage(category) {
  return STOCK_IMAGES[category] || STOCK_IMAGES.forecast;
}

const targetDate =
  process.argv[2] ||
  JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, "_last-run.json"), "utf8"))
    .runDate;

const manifest = JSON.parse(
  fs.readFileSync(path.join(DRAFTS_DIR, "_last-run.json"), "utf8")
);

const slugs =
  manifest.runDate === targetDate
    ? manifest.slugs
    : fs
        .readdirSync(DRAFTS_DIR)
        .filter((f) => f.endsWith(".mdx") && f.includes(targetDate))
        .map((f) => f.replace(/\.mdx$/, ""));

const forecasts = slugs.map((slug) => {
  const { frontmatter, body } = parseMdxFile(
    path.join(DRAFTS_DIR, `${slug}.mdx`)
  );
  const category = frontmatter.category || "forecast";

  return {
    slug: frontmatter.slug,
    title: frontmatter.title,
    excerpt: frontmatter.description,
    content: body,
    category,
    author: frontmatter.author || "Trading 100 Desk",
    publishedAt: new Date(`${frontmatter.publishDate}T06:00:00Z`).toISOString(),
    image: getCategoryImage(category),
    isOriginal: true,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  forecasts,
};

const outPath = path.join(__dirname, "kv-forecasts-payload.json");
fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(`Wrote ${forecasts.length} forecasts to ${outPath}`);
console.log(forecasts.map((f) => f.slug).join("\n"));
