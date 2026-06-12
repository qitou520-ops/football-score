import type { ChatMessageItem } from "./types";

const MAX_MESSAGES_PER_MATCH = 100;

type StoredMessage = ChatMessageItem;

const store = new Map<number, StoredMessage[]>();

function trimMessages(messages: StoredMessage[]): StoredMessage[] {
  if (messages.length <= MAX_MESSAGES_PER_MATCH) return messages;
  return messages.slice(messages.length - MAX_MESSAGES_PER_MATCH);
}

export function memoryGetMessages(matchId: number): ChatMessageItem[] {
  return [...(store.get(matchId) ?? [])];
}

export function memoryGetAllMessages(): ChatMessageItem[] {
  const all: ChatMessageItem[] = [];
  for (const messages of store.values()) {
    all.push(...messages);
  }
  return all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function memoryDeleteMessage(id: string): boolean {
  for (const [matchId, messages] of store.entries()) {
    const next = messages.filter((m) => m.id !== id);
    if (next.length !== messages.length) {
      store.set(matchId, next);
      return true;
    }
  }
  return false;
}

export function memoryClearMatch(matchId: number): number {
  const count = store.get(matchId)?.length ?? 0;
  store.delete(matchId);
  return count;
}

export function memoryCountMessages(): number {
  let n = 0;
  for (const messages of store.values()) n += messages.length;
  return n;
}

export function memoryAddMessage(
  matchId: number,
  nickname: string,
  message: string,
  ipHash?: string
): ChatMessageItem {
  const item: ChatMessageItem = {
    id: `mem-${matchId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    matchId,
    nickname,
    message,
    createdAt: new Date().toISOString(),
  };

  const list = store.get(matchId) ?? [];
  list.push(item);
  store.set(matchId, trimMessages(list));

  void ipHash;
  return item;
}
