import { NextRequest, NextResponse } from "next/server";
import { getCommentaryByMatchId } from "@/lib/data";
import { CACHE_HEADERS } from "@/lib/cache/headers";

type RouteParams = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const matchId = Number(id);

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "Invalid match ID" }, { status: 400 });
  }

  const data = await getCommentaryByMatchId(matchId);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": CACHE_HEADERS.LIVE,
    },
  });
}
