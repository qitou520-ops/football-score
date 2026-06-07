import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import { getFootballProvider, getFootballProviderId } from "@/lib/data";
import { getTodayApiRequestCount, getRecentApiLogs } from "@/lib/api-logs";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = getFootballProvider();
  const health = provider.getHealth();
  const [todayRequests, recentLogs] = await Promise.all([
    getTodayApiRequestCount(),
    getRecentApiLogs(10),
  ]);

  return NextResponse.json({
    connected: health.configured,
    providerId: health.providerId,
    providerName: health.providerName,
    apiKeyMasked: health.configured
      ? "••••••••（已配置，读取自环境变量）"
      : "未配置",
    todayRequests,
    season: process.env.API_FOOTBALL_SEASON || "2024",
    message: health.message,
    recentLogs: recentLogs.map((l) => ({
      endpoint: l.endpoint,
      statusCode: l.statusCode,
      cached: l.cached,
      durationMs: l.durationMs,
      createdAt: l.createdAt,
      error: l.error,
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = getFootballProvider();

  try {
    if (provider.clearCache) {
      await provider.clearCache();
    }
    const [live, today] = await Promise.all([
      provider.getLiveFixtures(),
      provider.getTodayFixtures(),
    ]);
    return NextResponse.json({
      success: true,
      providerId: getFootballProviderId(),
      liveCount: live.length,
      todayCount: today.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "刷新失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
