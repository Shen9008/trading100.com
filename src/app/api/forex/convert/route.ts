import { NextRequest, NextResponse } from "next/server";
import { convertCurrency } from "@/lib/api/frankfurter";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const amount = searchParams.get("amount") ?? "1";
  const from = searchParams.get("from") ?? "USD";
  const to = searchParams.get("to") ?? "EUR";

  try {
    const data = await convertCurrency(parseFloat(amount), from, to);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Conversion failed" }, { status: 502 });
  }
}
