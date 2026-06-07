import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { getStats } from "@/lib/cms";
import { getTodayFixtures, getLiveFixtures } from "@/lib/data";
import { getTodayApiRequestCount } from "@/lib/api-logs";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [cmsStats, todayMatches, liveMatches, apiRequests] = await Promise.all([
    getStats(),
    getTodayFixtures().catch(() => []),
    getLiveFixtures().catch(() => []),
    getTodayApiRequestCount(),
  ]);

  return NextResponse.json({
    ...cmsStats,
    todayMatches: todayMatches.length,
    liveMatches: liveMatches.length,
    apiRequests,
    articles: cmsStats.news,
    publishedArticles: cmsStats.publishedNews,
  });
}
