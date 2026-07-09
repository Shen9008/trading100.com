import { NextRequest, NextResponse } from "next/server";
import { getAutoPostedNews, getWireHeadlines } from "@/lib/api/wire-news";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format");

  try {
    if (format === "wire") {
      const data = await getWireHeadlines(20);
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    const data = await getAutoPostedNews(20);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
  }
}
