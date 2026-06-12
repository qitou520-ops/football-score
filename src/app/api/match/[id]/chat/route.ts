import { NextRequest, NextResponse } from "next/server";
import { addChatMessage, getChatMessages } from "@/lib/chat";
import { checkChatRateLimit } from "@/lib/chat/rate-limit";
import {
  generateGuestNickname,
  getClientIp,
  hashIp,
  sanitizeMessage,
  sanitizeNickname,
} from "@/lib/chat/security";

type RouteParams = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const matchId = Number(id);

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "无效的比赛 ID", messages: [] }, { status: 400 });
  }

  const data = await getChatMessages(matchId);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const matchId = Number(id);

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "无效的比赛 ID" }, { status: 400 });
  }

  let body: { message?: string; nickname?: string };
  try {
    body = (await request.json()) as { message?: string; nickname?: string };
  } catch {
    return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
  }

  const message = sanitizeMessage(body.message ?? "");
  if (!message) {
    return NextResponse.json({ error: "消息内容无效" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  if (!(await checkChatRateLimit(ipHash))) {
    return NextResponse.json(
      { error: "发送太频繁，请稍后再试", code: "rate_limited" },
      { status: 429 }
    );
  }

  const nickname = sanitizeNickname(body.nickname?.trim() || generateGuestNickname());
  const item = await addChatMessage(matchId, nickname, message, ipHash);

  return NextResponse.json({ message: item }, { status: 201 });
}
