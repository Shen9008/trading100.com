#!/usr/bin/env node
/**
 * Publishes committed MDX drafts from content/drafts/forecasts/ to KV
 * via POST /api/cron/daily-forecasts with { forecasts: Article[] }.
 *
 * Usage:
 *   CRON_SECRET=... node scripts/publish-forecast-drafts.mjs
 *   CRON_SECRET=... node scripts/publish-forecast-drafts.mjs --date 2026-07-12
 *   CRON_SECRET=... node scripts/publish-forecast-drafts.mjs --fallback-template
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseMdxFile } from "./mdx-frontmatter.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DRAFTS_DIR = path.join(ROOT, "content/drafts/forecasts");

const STOCK_IMAGES = {
  forex: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  forexPairs: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
  crypto: "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80",
  commodities: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
  gold: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  stocks: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
  indices: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80",
  forecast: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
};

function getCategoryImage(category) {
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
    default:
      return STOCK_IMAGES.forecast;
  }
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const WORD_COUNT_MIN = 950;
const WORD_COUNT_TARGET = 1000;

function parseArgs(argv) {
  const args = { date: null, fallbackTemplate: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--date" && argv[i + 1]) {
      args.date = argv[++i];
    } else if (argv[i] === "--fallback-template") {
      args.fallbackTemplate = true;
    }
  }
  return args;
}

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function mdxToArticle(frontmatter, body) {
  const category = frontmatter.category || "forecast";
  const publishDate = frontmatter.publishDate || todayUtcDate();

  return {
    slug: frontmatter.slug,
    title: frontmatter.title,
    excerpt: frontmatter.description,
    content: body,
    category,
    author: frontmatter.author || "Trading 100 Desk",
    publishedAt: new Date(`${publishDate}T06:00:00Z`).toISOString(),
    image: getCategoryImage(category),
    isOriginal: true,
  };
}

function isoDateToProseFragment(isoDate) {
  const [year, month, day] = isoDate.split("-");
  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return isoDate;
  return `${monthNames[monthIndex]}-${Number(day)}-${year}`;
}

function loadDraftsForDate(targetDate) {
  const manifestPath = path.join(DRAFTS_DIR, "_last-run.json");
  let slugs = [];

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.runDate === targetDate && Array.isArray(manifest.slugs)) {
      slugs = manifest.slugs;
    }
  }

  if (slugs.length === 0) {
    const proseDate = isoDateToProseFragment(targetDate);
    const files = fs
      .readdirSync(DRAFTS_DIR)
      .filter(
        (f) =>
          f.endsWith(".mdx") &&
          (f.includes(targetDate) || f.includes(proseDate))
      );

    slugs = files.map((f) => f.replace(/\.mdx$/, ""));
  }

  if (slugs.length === 0) {
    return null;
  }

  return slugs.map((slug) => {
    const filePath = path.join(DRAFTS_DIR, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Draft file missing: ${filePath}`);
    }
    const { frontmatter, body } = parseMdxFile(filePath);
    return mdxToArticle(frontmatter, body);
  });
}

async function publishForecasts(forecasts, siteUrl, cronSecret) {
  const response = await fetch(`${siteUrl}/api/cron/daily-forecasts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ forecasts }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      `Publish failed (${response.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function fallbackTemplate(siteUrl, cronSecret) {
  const response = await fetch(`${siteUrl}/api/cron/daily-forecasts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `Template fallback failed (${response.status}): ${JSON.stringify(data)}`
    );
  }

  return data;
}

async function main() {
  const args = parseArgs(process.argv);
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://trading100.com";

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is required");
    process.exit(1);
  }

  const targetDate = args.date || todayUtcDate();
  console.log(`Looking for drafts dated ${targetDate}...`);

  const forecasts = loadDraftsForDate(targetDate);

  if (!forecasts || forecasts.length === 0) {
    console.log(`No drafts found for ${targetDate}.`);
    if (args.fallbackTemplate) {
      console.log("Falling back to template generator...");
      const result = await fallbackTemplate(siteUrl, cronSecret);
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    process.exit(0);
  }

  console.log(`Publishing ${forecasts.length} draft(s) to KV...`);
  for (const forecast of forecasts) {
    const words = countWords(forecast.content);
    if (words < WORD_COUNT_MIN) {
      console.warn(
        `Warning: ${forecast.slug} is ${words} words (target ~${WORD_COUNT_TARGET}, minimum ${WORD_COUNT_MIN})`
      );
    } else {
      console.log(`  ${forecast.slug}: ${words} words`);
    }
  }
  const result = await publishForecasts(forecasts, siteUrl, cronSecret);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
