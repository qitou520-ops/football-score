import "server-only";

import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";
import * as memory from "./memory-store";
import type { ChatMessageItem, ChatMessagesResponse } from "./types";

const MAX_MESSAGES_PER_MATCH = 100;

function mapRow(row: {
  id: string;
  matchId: number;
  nickname: string;
  message: string;
  createdAt: Date;
}): ChatMessageItem {
  return {
    id: row.id,
    matchId: row.matchId,
    nickname: row.nickname,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  };
}

async function dbGetMessages(matchId: number): Promise<ChatMessageItem[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { matchId, status: "active" },
    orderBy: { createdAt: "asc" },
    take: MAX_MESSAGES_PER_MATCH,
  });
  return rows.map(mapRow);
}

async function dbAddMessage(
  matchId: number,
  nickname: string,
  message: string,
  ipHash?: string
): Promise<ChatMessageItem> {
  const row = await prisma.chatMessage.create({
    data: {
      matchId,
      nickname,
      message,
      ipHash,
      status: "active",
    },
  });

  const count = await prisma.chatMessage.count({
    where: { matchId, status: "active" },
  });
  if (count > MAX_MESSAGES_PER_MATCH) {
    const overflow = count - MAX_MESSAGES_PER_MATCH;
    const oldest = await prisma.chatMessage.findMany({
      where: { matchId, status: "active" },
      orderBy: { createdAt: "asc" },
      take: overflow,
      select: { id: true },
    });
    if (oldest.length > 0) {
      await prisma.chatMessage.deleteMany({
        where: { id: { in: oldest.map((r) => r.id) } },
      });
    }
  }

  return mapRow(row);
}

export async function getChatMessages(matchId: number): Promise<ChatMessagesResponse> {
  if (!shouldUseDatabase()) {
    return { matchId, messages: memory.memoryGetMessages(matchId) };
  }

  try {
    const messages = await dbGetMessages(matchId);
    return { matchId, messages };
  } catch {
    return { matchId, messages: memory.memoryGetMessages(matchId) };
  }
}

export async function adminListChatMessages(limit = 100): Promise<ChatMessageItem[]> {
  if (!shouldUseDatabase()) {
    return memory.memoryGetAllMessages().slice(0, limit);
  }
  try {
    const rows = await prisma.chatMessage.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(mapRow);
  } catch {
    return memory.memoryGetAllMessages().slice(0, limit);
  }
}

export async function adminDeleteChatMessage(id: string): Promise<boolean> {
  if (!shouldUseDatabase()) {
    return memory.memoryDeleteMessage(id);
  }
  try {
    const result = await prisma.chatMessage.updateMany({
      where: { id },
      data: { status: "deleted" },
    });
    return result.count > 0;
  } catch {
    return memory.memoryDeleteMessage(id);
  }
}

export async function adminClearMatchChat(matchId: number): Promise<number> {
  if (!shouldUseDatabase()) {
    return memory.memoryClearMatch(matchId);
  }
  try {
    const result = await prisma.chatMessage.updateMany({
      where: { matchId, status: "active" },
      data: { status: "deleted" },
    });
    return result.count;
  } catch {
    return memory.memoryClearMatch(matchId);
  }
}

export async function getChatMessageCount(): Promise<number> {
  if (!shouldUseDatabase()) {
    return memory.memoryCountMessages();
  }
  try {
    return await prisma.chatMessage.count({ where: { status: "active" } });
  } catch {
    return memory.memoryCountMessages();
  }
}

export async function addChatMessage(
  matchId: number,
  nickname: string,
  message: string,
  ipHash?: string
): Promise<ChatMessageItem> {
  if (!shouldUseDatabase()) {
    return memory.memoryAddMessage(matchId, nickname, message, ipHash);
  }

  try {
    return await dbAddMessage(matchId, nickname, message, ipHash);
  } catch {
    return memory.memoryAddMessage(matchId, nickname, message, ipHash);
  }
}
