#!/usr/bin/env node
/**
 * Ensures today's daily forecasts exist in KV.
 * 1) Publishes committed MDX drafts for today (if any)
 * 2) Falls back to template generator when --fallback-template is set
 * 3) Backfills any missing days in the lookback window
 * 4) Verifies /api/cron/daily-forecasts?status=1 reports no gaps
 *
 * Usage (GitHub Actions / manual):
 *   CRON_SECRET=... node scripts/ensure-daily-forecasts.mjs --fallback-template
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_LOOKBACK_DAYS = 14;

function parseArgs(argv) {
  return {
    fallbackTemplate: argv.includes("--fallback-template"),
    lookbackDays: (() => {
      const idx = argv.indexOf("--lookback-days");
      if (idx >= 0 && argv[idx + 1]) {
        const parsed = Number(argv[idx + 1]);
        if (Number.isFinite(parsed) && parsed > 0) {
          return Math.min(Math.floor(parsed), 30);
        }
      }
      return DEFAULT_LOOKBACK_DAYS;
    })(),
  };
}

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${scriptPath} exited with code ${code}`));
    });
  });
}

async function fetchStatus(siteUrl, cronSecret, lookbackDays) {
  const response = await fetch(
    `${siteUrl}/api/cron/daily-forecasts?status=1&lookback=${lookbackDays}`,
    {
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
    throw new Error(`Status check failed (${response.status}): ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  const { fallbackTemplate, lookbackDays } = parseArgs(process.argv);
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://trading100.com";

  if (!cronSecret) {
    console.error("CRON_SECRET environment variable is required");
    process.exit(1);
  }

  console.log(`Ensuring daily forecasts on ${siteUrl}...`);

  const publishArgs = ["scripts/publish-forecast-drafts.mjs"];
  if (fallbackTemplate) publishArgs.push("--fallback-template");
  await runNodeScript(publishArgs[0], publishArgs.slice(1));

  console.log(`Backfilling forecast gaps for the last ${lookbackDays} days...`);
  await runNodeScript("scripts/backfill-forecast-gaps.mjs", [
    "--days",
    String(lookbackDays),
  ]);

  const status = await fetchStatus(siteUrl, cronSecret, lookbackDays);
  console.log(JSON.stringify(status, null, 2));

  if (!status.hasToday) {
    console.error(
      `Verification failed: expected ${status.target} forecasts for ${status.today}, found ${status.count}`
    );
    process.exit(1);
  }

  if (status.missingDates?.length) {
    console.error(
      `Verification failed: missing forecast batches on ${status.missingDates.join(", ")}`
    );
    process.exit(1);
  }

  console.log(
    `Verified ${status.count}/${status.target} forecasts for ${status.today} (source: ${status.source ?? "unknown"}) with no gaps in ${lookbackDays}-day window.`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
