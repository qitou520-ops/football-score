"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import useSWR from "swr";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import type { ChatMessageItem, ChatMessagesResponse } from "@/lib/chat/types";

const NICKNAME_KEY = "fc_guest_nickname";

const fetcher = async (url: string): Promise<ChatMessagesResponse> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { matchId: 0, messages: [] };
  return res.json();
};

function getOrCreateNickname(guestPrefix: string): string {
  if (typeof window === "undefined") return guestPrefix;
  const stored = localStorage.getItem(NICKNAME_KEY);
  if (stored?.trim()) return stored.trim().slice(0, 20);
  const nickname = `${guestPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
  localStorage.setItem(NICKNAME_KEY, nickname);
  return nickname;
}

interface MatchChatRoomProps {
  matchId: number;
  labels: {
    title: string;
    nickname: string;
    placeholder: string;
    send: string;
    disclaimer: string;
    empty: string;
    sending: string;
    rateLimited: string;
    invalidMessage: string;
    guestPrefix: string;
  };
}

export function MatchChatRoom({ matchId, labels }: MatchChatRoomProps) {
  const locale = useLocale();
  const defaultNickname = useSyncExternalStore(
    () => () => {},
    () => getOrCreateNickname(labels.guestPrefix),
    () => labels.guestPrefix
  );
  const [nickname, setNickname] = useState(defaultNickname);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<ChatMessagesResponse>(
    `/api/match/${matchId}/chat`,
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: false, refreshWhenHidden: false }
  );

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/match/${matchId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, nickname }),
      });
      const json = (await res.json()) as {
        error?: string;
        code?: string;
        message?: ChatMessageItem;
      };

      if (!res.ok) {
        setError(
          json.code === "rate_limited" ? labels.rateLimited : json.error || labels.invalidMessage
        );
        return;
      }

      setInput("");
      localStorage.setItem(
        NICKNAME_KEY,
        nickname.trim().slice(0, 20) || getOrCreateNickname(labels.guestPrefix)
      );
      await mutate();
    } catch {
      setError(labels.invalidMessage);
    } finally {
      setSending(false);
    }
  }, [input, sending, matchId, nickname, labels.invalidMessage, mutate]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className={ds.sectionTitle}>{labels.title}</h3>
        <span className={ds.caption}>{labels.disclaimer}</span>
      </div>

      <div
        ref={listRef}
        className="h-48 md:h-56 overflow-y-auto px-3 py-2 space-y-2 bg-muted/10"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{labels.empty}</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="text-sm leading-relaxed">
              <span className="font-semibold text-primary mr-1.5">{msg.nickname}</span>
              <span className="text-foreground break-words">{msg.message}</span>
              <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
                {formatTime(msg.createdAt)}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2.5 border-t border-border space-y-2">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`chat-nick-${matchId}`}>
            {labels.nickname}
          </label>
          <input
            id={`chat-nick-${matchId}`}
            type="text"
            value={nickname}
            suppressHydrationWarning
            onChange={(e) => setNickname(e.target.value.slice(0, 20))}
            className="w-24 shrink-0 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            placeholder={labels.nickname}
            maxLength={20}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 200))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            className="flex-1 min-w-0 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            placeholder={labels.placeholder}
            maxLength={200}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || sending}
            className={cn(
              "shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md",
              "bg-primary text-primary-foreground",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "hover:opacity-90 transition-opacity"
            )}
            aria-label={labels.send}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {sending && (
          <p className="text-xs text-muted-foreground">{labels.sending}</p>
        )}
      </div>
    </div>
  );
}
