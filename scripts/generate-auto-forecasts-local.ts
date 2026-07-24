import type { DailyInstrumentId } from "../src/lib/forecasts/instrument-rotation";
import { generateDailyForecasts } from "../src/lib/services/daily-forecast-generator";

function parseInstrumentFromAutoSlug(slug: string): DailyInstrumentId | null {
  const match = slug.match(
    /^(bitcoin|ethereum|eur-usd|gbp-usd|usd-jpy|aud-usd|gold-xauusd|silver-xagusd|brent-crude|sp500|nasdaq-100)-auto-\d{4}-\d{2}-\d{2}$/
  );
  return (match?.[1] as DailyInstrumentId | undefined) ?? null;
}

function groupAutoSlugsByDate(autoSlugs: string[]): Map<string, DailyInstrumentId[]> {
  const byDate = new Map<string, DailyInstrumentId[]>();

  for (const slug of autoSlugs) {
    const instrument = parseInstrumentFromAutoSlug(slug);
    const dateMatch = slug.match(/-auto-(\d{4}-\d{2}-\d{2})$/);
    if (!instrument || !dateMatch) continue;

    const date = dateMatch[1];
    const list = byDate.get(date) ?? [];
    if (!list.includes(instrument)) list.push(instrument);
    byDate.set(date, list);
  }

  return byDate;
}

async function main() {
  const daysArg = process.argv.find((arg) => arg.startsWith("--days="));
  const days = daysArg ? Number(daysArg.split("=")[1]) : 14;
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://trading100.com";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is required");
    process.exit(1);
  }

  const statusRes = await fetch(
    `${siteUrl}/api/cron/daily-forecasts?status=1&lookback=${days}`,
    { headers: { Authorization: `Bearer ${cronSecret}` } }
  );
  const status = (await statusRes.json()) as {
    autoSlugs?: string[];
    autoDates?: string[];
  };

  const autoSlugs = status.autoSlugs ?? [];
  const byDate = groupAutoSlugsByDate(autoSlugs);
  const dates = Array.from(byDate.keys()).sort();

  if (dates.length === 0) {
    console.error("No -auto- forecast slugs found in archive");
    process.exit(1);
  }

  const allForecasts = [];

  for (const isoDate of dates) {
    const instrumentIds = byDate.get(isoDate) ?? [];
    console.error(`Generating ${instrumentIds.length} forecast(s) for ${isoDate}...`);

    const forecasts = await generateDailyForecasts({
      asOfDate: isoDate,
      instrumentIds,
    });

    for (const forecast of forecasts) {
      const words = forecast.content.trim().split(/\s+/).filter(Boolean).length;
      const hasLiveData = !forecast.content.includes(
        "Live chart data was unavailable"
      );
      console.error(
        `  ${forecast.slug}: ${words} words${hasLiveData ? "" : " (FALLBACK — no live data)"}`
      );
    }

    allForecasts.push(...forecasts);
  }

  console.log(JSON.stringify(allForecasts));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
