import { NextRequest, NextResponse } from "next/server";
import {
  DAILY_NEWS_COUNT,
  sourceDailyNewsArticles,
} from "@/lib/services/daily-news-sourcer";
import { loadAutoNews } from "@/lib/kv/forecasts-store";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.nextUrl.searchParams.get("secret") === secret;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("status") === "1") {
    const cache = await loadAutoNews();
    return NextResponse.json({
      ok: true,
      target: DAILY_NEWS_COUNT,
      articles: cache?.articles?.length ?? 0,
      fetchedAt: cache?.fetchedAt ?? null,
    });
  }

  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sourceDailyNewsArticles(DAILY_NEWS_COUNT);

    if (result.articles.length === 0) {
      return NextResponse.json(
        {
          error: "No articles sourced",
          source: result.source,
          hint: "RSS feeds and API keys may be unavailable. Retry later or check secrets.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      synced: result.articles.length,
      target: DAILY_NEWS_COUNT,
      source: result.source,
      fetchedAt: result.fetchedAt,
      titles: result.articles.map((a) => a.title),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Daily news sourcing failed", detail: String(error) },
      { status: 500 }
    );
  }
}
