import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/data";
import { CACHE_HEADERS } from "@/lib/cache/headers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json({ teams: [], players: [] });
  }

  const data = await searchAll(q);
  return NextResponse.json(data, {
    headers: { "Cache-Control": CACHE_HEADERS.TEAM },
  });
}
