import { NextRequest, NextResponse } from "next/server";
import type { Article } from "@/lib/data/articles";
import { FORECAST_ARTICLES } from "@/lib/data/forecasts";
import {
  countForecastsForDate,
  DAILY_BATCH_SIZE,
  DAILY_FORECAST_TARGET,
  findMissingDates,
  forecastMatchesDate,
  hasFullDailyBatch,
  mergeArticlesBySlug,
} from "@/lib/forecasts/daily-coverage";
import {
  generateDailyForecasts,
  resolveDailyInstrumentIds,
} from "@/lib/services/daily-forecast-generator";
import {
  getInstrumentsForDate,
  selectDailyInstrumentsFromArchive,
} from "@/lib/forecasts/instrument-rotation";
import {
  loadDailyForecasts,
  loadLatestDailyForecasts,
  saveDailyForecasts,
} from "@/lib/kv/forecasts-store";

export const dynamic = "force-dynamic";

const DEFAULT_BACKFILL_DAYS = 14;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === secret;
}

function isValidArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") return false;
  const article = value as Article;
  return (
    typeof article.slug === "string" &&
    typeof article.title === "string" &&
    typeof article.excerpt === "string" &&
    typeof article.content === "string" &&
    typeof article.category === "string" &&
    typeof article.author === "string" &&
    typeof article.publishedAt === "string" &&
    typeof article.image === "string"
  );
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

async function getAllKnownForecasts(): Promise<Article[]> {
  const archive = await loadDailyForecasts();
  return mergeArticlesBySlug(archive, FORECAST_ARTICLES);
}

function buildStatusPayload(
  allArticles: Article[],
  lookbackDays: number
) {
  const today = utcToday();
  const missingDates = findMissingDates(allArticles, lookbackDays);
  const todaysForecasts = allArticles.filter((f) =>
    forecastMatchesDate(f, today)
  );
  const instrumentsToday = getInstrumentsForDate(allArticles, today);
  const plannedInstruments = selectDailyInstrumentsFromArchive(
    allArticles,
    today
  );

  return {
    ok: true,
    today,
    target: DAILY_FORECAST_TARGET,
    count: todaysForecasts.length,
    hasToday: hasFullDailyBatch(allArticles, today),
    lookbackDays,
    missingDates,
    hasGaps: missingDates.length > 0,
    archiveTotal: allArticles.length,
    slugs: todaysForecasts.map((f) => f.slug),
    instrumentsToday,
    plannedInstruments,
    instrumentPoolSize: 11,
    source: todaysForecasts.some((f) => f.slug.includes("-auto-"))
      ? "template"
      : todaysForecasts.length > 0
        ? "drafts"
        : null,
  };
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("status") === "1") {
    const lookbackDays = Number(
      request.nextUrl.searchParams.get("lookback") ?? DEFAULT_BACKFILL_DAYS
    );
    const safeLookback =
      Number.isFinite(lookbackDays) && lookbackDays > 0
        ? Math.min(Math.floor(lookbackDays), 30)
        : DEFAULT_BACKFILL_DAYS;

    const latest = await loadLatestDailyForecasts();
    const allArticles = await getAllKnownForecasts();
    const status = buildStatusPayload(allArticles, safeLookback);

    return NextResponse.json({
      ...status,
      generatedAt: latest?.generatedAt ?? null,
    });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const asOfDate = parseIsoDate(request.nextUrl.searchParams.get("date"));
    return await generateTemplateForecasts(asOfDate ?? undefined);
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}

async function publishDraftForecasts(forecasts: Article[]) {
  if (forecasts.length === 0) {
    return NextResponse.json(
      { error: "forecasts array must not be empty" },
      { status: 400 }
    );
  }

  const invalid = forecasts.find((f) => !isValidArticle(f));
  if (invalid) {
    return NextResponse.json(
      { error: "Invalid forecast article payload", slug: (invalid as Article).slug },
      { status: 400 }
    );
  }

  await saveDailyForecasts(forecasts);

  return NextResponse.json({
    ok: true,
    source: "drafts",
    published: forecasts.length,
    slugs: forecasts.map((f) => f.slug),
    publishedAt: new Date().toISOString(),
  });
}

async function generateTemplateForecasts(asOfDate?: string) {
  const isoDate = asOfDate ?? utcToday();
  const archive = await getAllKnownForecasts();
  const instruments = resolveDailyInstrumentIds({
    asOfDate: isoDate,
    archiveArticles: archive,
  });
  const forecasts = await generateDailyForecasts({
    asOfDate: isoDate,
    archiveArticles: archive,
    instrumentIds: instruments,
  });
  await saveDailyForecasts(forecasts, { replaceDate: isoDate });

  return NextResponse.json({
    ok: true,
    source: "template",
    generated: forecasts.length,
    target: DAILY_BATCH_SIZE,
    asOfDate: isoDate,
    instruments,
    slugs: forecasts.map((f) => f.slug),
    generatedAt: new Date().toISOString(),
  });
}

async function backfillMissingDates(daysBack: number) {
  const safeDays =
    Number.isFinite(daysBack) && daysBack > 0
      ? Math.min(Math.floor(daysBack), 30)
      : DEFAULT_BACKFILL_DAYS;

  const filled: string[] = [];
  const skipped: string[] = [];

  for (let pass = 0; pass < safeDays; pass += 1) {
    const allArticles = await getAllKnownForecasts();
    const missingDates = findMissingDates(allArticles, safeDays);
    const nextDate = missingDates[0];

    if (!nextDate) break;

    const beforeCount = countForecastsForDate(allArticles, nextDate);
    if (beforeCount >= DAILY_FORECAST_TARGET) {
      skipped.push(nextDate);
      continue;
    }

    const instruments = resolveDailyInstrumentIds({
      asOfDate: nextDate,
      archiveArticles: allArticles,
    });
    const forecasts = await generateDailyForecasts({
      asOfDate: nextDate,
      archiveArticles: allArticles,
      instrumentIds: instruments,
    });
    await saveDailyForecasts(forecasts, { replaceDate: nextDate });
    filled.push(nextDate);
  }

  const finalArticles = await getAllKnownForecasts();
  const remainingMissing = findMissingDates(finalArticles, safeDays);

  return NextResponse.json({
    ok: remainingMissing.length === 0,
    backfillDays: safeDays,
    filled,
    skipped,
    remainingMissing,
    hasGaps: remainingMissing.length > 0,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backfillDaysParam = request.nextUrl.searchParams.get("backfill-days");
  if (backfillDaysParam !== null) {
    try {
      const days = Number(backfillDaysParam || DEFAULT_BACKFILL_DAYS);
      return await backfillMissingDates(days);
    } catch (error) {
      return NextResponse.json(
        { error: "Backfill failed", detail: String(error) },
        { status: 500 }
      );
    }
  }

  const asOfDate = parseIsoDate(request.nextUrl.searchParams.get("date"));

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { forecasts?: unknown };
      if (Array.isArray(body.forecasts) && body.forecasts.length > 0) {
        return await publishDraftForecasts(body.forecasts as Article[]);
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON body", detail: String(error) },
        { status: 400 }
      );
    }
  }

  try {
    return await generateTemplateForecasts(asOfDate ?? undefined);
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
