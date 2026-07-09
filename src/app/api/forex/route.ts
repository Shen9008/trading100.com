import { NextRequest, NextResponse } from "next/server";
import { convertCurrency, fetchLatestRates } from "@/lib/api/frankfurter";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const amount = searchParams.get("amount");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (amount && from && to) {
    try {
      const data = await convertCurrency(parseFloat(amount), from, to);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: "Conversion failed" }, { status: 502 });
    }
  }

  try {
    const base = searchParams.get("base") ?? "USD";
    const toParam = searchParams.get("to");
    const toList = toParam ? toParam.split(",") : undefined;
    const data = await fetchLatestRates(base, toList);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
  }
}
