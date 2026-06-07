import { NextRequest, NextResponse } from "next/server";
import { getStandings } from "@/lib/data";
import { ApiFootballError } from "@/lib/api-football";
import { CACHE_HEADERS } from "@/lib/cache/headers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const leagueId = Number(id);

  if (!Number.isFinite(leagueId)) {
    return NextResponse.json({ error: "无效的联赛 ID", standings: [] }, { status: 400 });
  }

  try {
    const standings = await getStandings(leagueId);
    return NextResponse.json(
      { standings, leagueId },
      {
        headers: {
          "Cache-Control": CACHE_HEADERS.STANDINGS,
        },
      }
    );
  } catch (err) {
    const message =
      err instanceof ApiFootballError ? err.message : "获取积分榜失败";
    return NextResponse.json(
      { standings: [], leagueId, error: message },
      { status: 502 }
    );
  }
}
