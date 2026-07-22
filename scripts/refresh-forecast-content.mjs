#!/usr/bin/env node
/**
 * Regenerates existing template (-auto-) forecast articles in KV
 * using the live market analysis engine.
 *
 * Usage:
 *   CRON_SECRET=... node scripts/refresh-forecast-content.mjs
 *   CRON_SECRET=... node scripts/refresh-forecast-content.mjs --days 30
 */

const DEFAULT_DAYS = 30;

function parseArgs(argv) {
  let days = DEFAULT_DAYS;
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--days" && argv[i + 1]) {
      days = Number(argv[++i]);
    }
  }
  return {
    days: Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_DAYS,
  };
}

async function main() {
  const { days } = parseArgs(process.argv);
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://trading100.com";

  if (!cronSecret) {
    console.error("CRON_SECRET is required");
    process.exit(1);
  }

  console.log(`Refreshing -auto- forecasts on ${siteUrl} (last ${days} days)...`);

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
    console.error("Refresh failed:", data);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
