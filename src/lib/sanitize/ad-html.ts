const BLOCKED_TAGS =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|textarea|select|link|meta|base|style)\b[^>]*>/gi;

const EVENT_HANDLERS = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_PROTOCOL = /(href|src|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi;
const DATA_PROTOCOL = /(href|src)\s*=\s*("|')\s*data:text\/html[^"']*\2/gi;

/** 后台广告 HTML 消毒，移除脚本与危险属性 */
export function sanitizeAdHtml(html: string): string {
  if (!html?.trim()) return "";

  let safe = html
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_PROTOCOL, "")
    .replace(DATA_PROTOCOL, "");

  // 移除嵌套 script（二次清理）
  safe = safe.replace(BLOCKED_TAGS, "");

  return safe.trim();
}
