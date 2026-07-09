import { NextResponse } from "next/server";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";

export async function GET() {
  try {
    const data = await fetchCryptoMarkets();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 502 }
    );
  }
}
