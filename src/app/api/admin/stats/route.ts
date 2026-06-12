import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { getStats } from "@/lib/cms";
import { getTodayFixtures, getLiveFixtures } from "@/lib/data";
import { getTodayApiRequestCount } from "@/lib/api-logs";
import { getChatMessageCount } from "@/lib/chat";
import { shouldUseDatabase } from "@/lib/db/is-enabled";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [cmsStats, todayMatches, liveMatches, apiRequests, chatMessages] = await Promise.all([
    getStats(),
    getTodayFixtures().catch(() => []),
    getLiveFixtures().catch(() => []),
    getTodayApiRequestCount(),
    getChatMessageCount(),
  ]);

  return NextResponse.json({
    ...cmsStats,
    todayMatches: todayMatches.length,
    liveMatches: liveMatches.length,
    apiRequests,
    chatMessages,
    databaseMode: shouldUseDatabase(),
    articles: cmsStats.news,
    publishedArticles: cmsStats.publishedNews,
  });
}
