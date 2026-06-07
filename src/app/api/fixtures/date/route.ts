import { NextRequest, NextResponse } from "next/server";
import { getFixturesByDate } from "@/lib/data";
import { CACHE_HEADERS } from "@/lib/cache/headers";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "获取比赛数据失败";
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "日期格式无效", fixtures: [] }, { status: 400 });
  }

  try {
    const fixtures = await getFixturesByDate(date);
    return NextResponse.json(
      { fixtures, date },
      {
        headers: {
          "Cache-Control": CACHE_HEADERS.FIXTURE,
        },
      }
    );
  } catch (err) {
    console.error("[api/fixtures/date]", err);
    return NextResponse.json(
      { fixtures: [], date, error: errorMessage(err) },
      { status: 502 }
    );
  }
}
