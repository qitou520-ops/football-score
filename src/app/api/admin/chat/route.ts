import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/auth";
import {
  adminListChatMessages,
  adminDeleteChatMessage,
  adminClearMatchChat,
} from "@/lib/chat";

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = Number(request.nextUrl.searchParams.get("limit") || "100");
  const messages = await adminListChatMessages(limit);
  return NextResponse.json({ messages });
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  const matchId = request.nextUrl.searchParams.get("matchId");

  if (matchId) {
    const cleared = await adminClearMatchChat(Number(matchId));
    return NextResponse.json({ success: true, cleared });
  }

  if (!id) {
    return NextResponse.json({ error: "缺少 id 或 matchId" }, { status: 400 });
  }

  const ok = await adminDeleteChatMessage(id);
  if (!ok) return NextResponse.json({ error: "消息不存在" }, { status: 404 });
  return NextResponse.json({ success: true });
}
