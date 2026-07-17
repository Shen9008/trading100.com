import { NextRequest, NextResponse } from "next/server";
import type { Article } from "@/lib/data/articles";
import {
  generateDailyForecasts,
  DAILY_INSTRUMENT_IDS,
} from "@/lib/services/daily-forecast-generator";
import {
  loadDailyForecasts,
  loadLatestDailyForecasts,
  saveDailyForecasts,
} from "@/lib/kv/forecasts-store";

export const dynamic = "force-dynamic";

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

function forecastMatchesToday(article: Article, today: string): boolean {
  const publishedDay = article.publishedAt.slice(0, 10);
  if (publishedDay === today) return true;
  return article.slug.includes(today);
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("status") === "1") {
    const today = utcToday();
    const latest = await loadLatestDailyForecasts();
    const archive = await loadDailyForecasts();
    const todaysForecasts = archive.filter((f) => forecastMatchesToday(f, today));

    return NextResponse.json({
      ok: true,
      today,
      target: DAILY_INSTRUMENT_IDS.length,
      count: todaysForecasts.length,
      hasToday: todaysForecasts.length >= DAILY_INSTRUMENT_IDS.length,
      generatedAt: latest?.generatedAt ?? null,
      archiveTotal: archive.length,
      slugs: todaysForecasts.map((f) => f.slug),
      source: todaysForecasts.some((f) => f.slug.includes("-auto-"))
        ? "template"
        : todaysForecasts.length > 0
          ? "drafts"
          : null,
    });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await generateTemplateForecasts();
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

async function generateTemplateForecasts() {
  const forecasts = await generateDailyForecasts();
  await saveDailyForecasts(forecasts);

  return NextResponse.json({
    ok: true,
    source: "template",
    generated: forecasts.length,
    target: DAILY_INSTRUMENT_IDS.length,
    instruments: DAILY_INSTRUMENT_IDS,
    slugs: forecasts.map((f) => f.slug),
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return await generateTemplateForecasts();
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
