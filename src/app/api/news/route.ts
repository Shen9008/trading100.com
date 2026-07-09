import { NextRequest, NextResponse } from "next/server";
import { fetchFinnhubNews } from "@/lib/api/finnhub";

export async function GET(request: NextRequest) {
  const category = (request.nextUrl.searchParams.get("category") ??
    "general") as "general" | "forex" | "crypto" | "merger";

  try {
    const data = await fetchFinnhubNews(category);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
  }
}
