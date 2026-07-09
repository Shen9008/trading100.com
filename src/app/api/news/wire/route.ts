import { NextResponse } from "next/server";
import { getWireHeadlines } from "@/lib/api/wire-news";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getWireHeadlines(15);
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
