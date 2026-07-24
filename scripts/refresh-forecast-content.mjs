#!/usr/bin/env node
/**
 * Regenerates existing template (-auto-) forecast articles in KV
 * using LOCAL market data (Yahoo/CoinGecko work from Node; Cloudflare Workers often cannot reach Yahoo).
 *
 * Usage:
 *   CRON_SECRET=... node scripts/refresh-forecast-content.mjs
 *   CRON_SECRET=... node scripts/refresh-forecast-content.mjs --days 30
 *   CRON_SECRET=... node scripts/refresh-forecast-content.mjs --remote  (server-side, legacy)
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_DAYS = 14;

function parseArgs(argv) {
  let days = DEFAULT_DAYS;
  let remote = false;
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--days" && argv[i + 1]) {
      days = Number(argv[++i]);
    } else if (argv[i] === "--remote") {
      remote = true;
    }
  }
  return {
    days: Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_DAYS,
    remote,
  };
}

function runTsx(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", ...args], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "inherit"],
      shell: true,
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`tsx exited with code ${code}`));
    });
  });
}

async function refreshRemote(siteUrl, cronSecret, days) {
  const response = await fetch(
    `${siteUrl}/api/cron/daily-forecasts?refresh-days=${days}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${cronSecret}` },
    }
  );

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Remote refresh failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function publishForecasts(siteUrl, cronSecret, forecasts) {
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
    throw new Error(`Publish failed: ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  const { days, remote } = parseArgs(process.argv);
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://trading100.com";

  if (!cronSecret) {
    console.error("CRON_SECRET is required");
    process.exit(1);
  }

  if (remote) {
    console.log(`Remote refresh on ${siteUrl} (last ${days} days)...`);
    const data = await refreshRemote(siteUrl, cronSecret, days);
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`Local refresh → KV publish on ${siteUrl} (last ${days} days)...`);

  const stdout = await runTsx([
    path.join("scripts", "generate-auto-forecasts-local.ts"),
    `--days=${days}`,
  ]);

  const forecasts = JSON.parse(stdout);
  if (!Array.isArray(forecasts) || forecasts.length === 0) {
    throw new Error("Local generator returned no forecasts");
  }

  const batchSize = 10;
  let published = 0;
  const slugs = [];

  for (let i = 0; i < forecasts.length; i += batchSize) {
    const batch = forecasts.slice(i, i + batchSize);
    const result = await publishForecasts(siteUrl, cronSecret, batch);
    published += result.published ?? batch.length;
    slugs.push(...batch.map((f) => f.slug));
    console.log(`Published batch ${Math.floor(i / batchSize) + 1} (${batch.length} articles)`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        source: "local-refresh",
        refreshDays: days,
        articlesUpdated: published,
        slugs,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
