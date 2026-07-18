#!/usr/bin/env node
/**
 * Backfills missing daily forecast batches in KV for recent days.
 * Tries committed MDX drafts first, then template generator per missing date.
 *
 * Usage:
 *   CRON_SECRET=... node scripts/backfill-forecast-gaps.mjs
 *   CRON_SECRET=... node scripts/backfill-forecast-gaps.mjs --days 14
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_DAYS = 14;

function parseArgs(argv) {
  let days = DEFAULT_DAYS;
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--days" && argv[i + 1]) {
      days = Number(argv[++i]);
    }
  }
  return { days: Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_DAYS };
}

async function fetchStatus(siteUrl, cronSecret, days) {
  const response = await fetch(
    `${siteUrl}/api/cron/daily-forecasts?status=1&lookback=${days}`,
    { headers: { Authorization: `Bearer ${cronSecret}` } }
  );

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Status check failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

function runPublishForDate(date, fallbackTemplate) {
  return new Promise((resolve, reject) => {
    const args = ["scripts/publish-forecast-drafts.mjs", "--date", date];
    if (fallbackTemplate) args.push("--fallback-template");

    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`publish-forecast-drafts.mjs exited with code ${code} for ${date}`));
    });
  });
}

async function runServerBackfill(siteUrl, cronSecret, days) {
  const response = await fetch(
    `${siteUrl}/api/cron/daily-forecasts?backfill-days=${days}`,
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
    throw new Error(`Server backfill failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  const { days } = parseArgs(process.argv);
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://trading100.com";

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is required");
    process.exit(1);
  }

  console.log(`Checking forecast coverage for the last ${days} days...`);
  let status = await fetchStatus(siteUrl, cronSecret, days);
  console.log(JSON.stringify(status, null, 2));

  if (!status.missingDates?.length) {
    console.log("No forecast gaps detected.");
    return;
  }

  console.log(`Missing dates: ${status.missingDates.join(", ")}`);

  for (const date of status.missingDates) {
    console.log(`\nPublishing drafts for ${date} (template fallback enabled)...`);
    try {
      await runPublishForDate(date, true);
    } catch (error) {
      console.warn(`Draft publish failed for ${date}: ${error.message || error}`);
    }
  }

  status = await fetchStatus(siteUrl, cronSecret, days);
  if (status.missingDates?.length) {
    console.log(
      `\nRunning server-side template backfill for remaining gaps: ${status.missingDates.join(", ")}`
    );
    const backfill = await runServerBackfill(siteUrl, cronSecret, days);
    console.log(JSON.stringify(backfill, null, 2));
  }

  status = await fetchStatus(siteUrl, cronSecret, days);
  console.log(JSON.stringify(status, null, 2));

  if (status.missingDates?.length) {
    console.error(
      `Backfill incomplete — still missing: ${status.missingDates.join(", ")}`
    );
    process.exit(1);
  }

  console.log(`Backfill complete — all ${days} days have ${status.target} forecasts.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
