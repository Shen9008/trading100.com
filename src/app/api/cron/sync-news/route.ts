import { NextRequest, NextResponse } from "next/server";
import type { NewsApiArticle } from "@/lib/api/newsapi";
import {
  loadAutoNews,
  loadWireCache,
} from "@/lib/kv/forecasts-store";
import {
  syncNewsFromApis,
  syncNewsFromPayload,
} from "@/lib/services/news-sync";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.nextUrl.searchParams.get("secret") === secret;
}

type SyncBody = {
  articles?: NewsApiArticle[];
};

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("status") === "1") {
    const autoNews = await loadAutoNews();
    const wire = await loadWireCache();
    const ageMs = autoNews?.fetchedAt
      ? Date.now() - new Date(autoNews.fetchedAt).getTime()
      : null;

    return NextResponse.json({
      ok: true,
      autoPosts: autoNews?.articles?.length ?? 0,
      wireItems: wire?.items?.length ?? 0,
      fetchedAt: autoNews?.fetchedAt ?? null,
      wireFetchedAt: wire?.fetchedAt ?? null,
      ageMinutes: ageMs !== null ? Math.round(ageMs / 60000) : null,
      sources: {
        newsapi: Boolean(process.env.NEWSAPI_API_KEY),
        marketaux: Boolean(process.env.MARKETAUX_API_KEY),
        finnhub: Boolean(process.env.FINNHUB_API_KEY),
      },
    });
  }

  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let raw: NewsApiArticle[] = [];

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as SyncBody;
      raw = body.articles ?? [];
    }

    const result =
      raw.length > 0
        ? await syncNewsFromPayload(raw)
        : await syncNewsFromApis(25);

    if (result.articles.length === 0) {
      return NextResponse.json(
        {
          error: "No articles fetched",
          source: result.source,
          hint: "Set FINNHUB_API_KEY on the Worker (primary). RSS and NewsAPI/Marketaux are optional fallbacks.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      synced: result.articles.length,
      source: result.source,
      fetchedAt: result.fetchedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", detail: String(error) },
      { status: 500 }
    );
  }
}
