import { NextRequest, NextResponse } from "next/server";
import { generateDailyForecasts } from "@/lib/services/daily-forecast-generator";
import { saveDailyForecasts } from "@/lib/kv/forecasts-store";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret");
  return querySecret === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forecasts = await generateDailyForecasts();
    await saveDailyForecasts(forecasts);

    return NextResponse.json({
      ok: true,
      generated: forecasts.length,
      slugs: forecasts.map((f) => f.slug),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
