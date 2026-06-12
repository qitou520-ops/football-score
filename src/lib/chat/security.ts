import "server-only";

import { createHash } from "crypto";

const MAX_MESSAGE_LENGTH = 200;
const MAX_NICKNAME_LENGTH = 20;
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;

export function hashIp(ip: string): string {
  const salt = process.env.CHAT_IP_SALT || "football-scores-chat";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function sanitizeNickname(raw: string): string {
  const cleaned = raw
    .replace(SCRIPT_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .trim()
    .slice(0, MAX_NICKNAME_LENGTH);
  return cleaned || "游客";
}

export function sanitizeMessage(raw: string): string | null {
  const cleaned = raw
    .replace(SCRIPT_PATTERN, "")
    .replace(HTML_TAG_PATTERN, "")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
  if (!cleaned) return null;
  return cleaned;
}

export function generateGuestNickname(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `游客${num}`;
}
