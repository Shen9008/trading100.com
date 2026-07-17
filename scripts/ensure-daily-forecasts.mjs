#!/usr/bin/env node
/**
 * Ensures today's daily forecasts exist in KV.
 * 1) Publishes committed MDX drafts for today (if any)
 * 2) Falls back to template generator when --fallback-template is set
 * 3) Verifies /api/cron/daily-forecasts?status=1 reports today's batch
 *
 * Usage (GitHub Actions / manual):
 *   CRON_SECRET=... node scripts/ensure-daily-forecasts.mjs --fallback-template
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  return {
    fallbackTemplate: argv.includes("--fallback-template"),
  };
}

function runPublishScript(fallbackTemplate) {
  return new Promise((resolve, reject) => {
    const args = ["scripts/publish-forecast-drafts.mjs"];
    if (fallbackTemplate) args.push("--fallback-template");

    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`publish-forecast-drafts.mjs exited with code ${code}`));
    });
  });
}

async function fetchStatus(siteUrl, cronSecret) {
  const response = await fetch(`${siteUrl}/api/cron/daily-forecasts?status=1`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

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
  const { fallbackTemplate } = parseArgs(process.argv);
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
  await runPublishScript(fallbackTemplate);

  const status = await fetchStatus(siteUrl, cronSecret);
  console.log(JSON.stringify(status, null, 2));

  if (!status.hasToday) {
    console.error(
      `Verification failed: expected ${status.target} forecasts for ${status.today}, found ${status.count}`
    );
    process.exit(1);
  }

  console.log(
    `Verified ${status.count}/${status.target} forecasts for ${status.today} (source: ${status.source ?? "unknown"})`
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
