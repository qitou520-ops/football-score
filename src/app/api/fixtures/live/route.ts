import { NextResponse } from "next/server";
import { getLiveFixtures } from "@/lib/data";
import { CACHE_HEADERS } from "@/lib/cache/headers";

export const dynamic = "force-dynamic";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "获取实时比赛失败";
}

export async function GET() {
  try {
    const fixtures = await getLiveFixtures();
    return NextResponse.json(
      { fixtures },
      {
        headers: {
          "Cache-Control": CACHE_HEADERS.LIVE,
        },
      }
    );
  } catch (err) {
    console.error("[api/fixtures/live]", err);
    return NextResponse.json(
      { fixtures: [], error: errorMessage(err) },
      { status: 502 }
    );
  }
}
