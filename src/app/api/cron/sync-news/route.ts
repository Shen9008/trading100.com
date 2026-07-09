import { NextRequest, NextResponse } from "next/server";
import type { NewsApiArticle } from "@/lib/api/newsapi";
import { fetchNewsApiFinance } from "@/lib/api/newsapi";
import {
  newsapiToArticle,
  newsapiToWireHeadline,
} from "@/lib/services/newsapi-news";
import { saveAutoNews, saveWireCache } from "@/lib/kv/forecasts-store";

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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let raw: NewsApiArticle[] = [];

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as SyncBody & {
        status?: string;
        articles?: NewsApiArticle[];
      };
      raw = body.articles ?? [];
    }

    if (raw.length === 0) {
      raw = await fetchNewsApiFinance(25);
    }

    if (raw.length === 0) {
      return NextResponse.json(
        {
          error: "No articles fetched",
          hint: "NewsAPI free plan blocks Cloudflare IPs — use GitHub Actions workflow to push articles.",
        },
        { status: 502 }
      );
    }

    const articles = raw.map(newsapiToArticle);
    const wire = raw.map(newsapiToWireHeadline);
    const fetchedAt = new Date().toISOString();

    await saveAutoNews({ fetchedAt, articles });
    await saveWireCache({
      fetchedAt,
      items: wire.map((item) => ({
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime,
        image: item.image,
      })),
    });

    return NextResponse.json({
      ok: true,
      synced: articles.length,
      fetchedAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
