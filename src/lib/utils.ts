import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmptyStatusValue(value?: string | null): boolean {
  if (value == null) return true;
  const v = String(value).trim();
  return v === "" || v === "null" || v === "undefined";
}

export function normalizeStatusShort(short?: string | null): string {
  if (isEmptyStatusValue(short)) return "NS";
  return short!.trim();
}

const STATUS_LONG_ZH: Record<string, string> = {
  NS: "未开始",
  TBD: "未开始",
  "1H": "上半场",
  HT: "中场休息",
  "2H": "下半场",
  ET: "加时赛",
  BT: "中断",
  P: "点球大战",
  LIVE: "进行中",
  FT: "已结束",
  AET: "加时结束",
  PEN: "点球结束",
  PST: "推迟",
  CANC: "取消",
  ABD: "中止",
  AWD: "判定",
  WO: "弃权",
};

const STATUS_LONG_EN: Record<string, string> = {
  NS: "Not Started",
  TBD: "TBD",
  "1H": "1st Half",
  HT: "Half Time",
  "2H": "2nd Half",
  ET: "Extra Time",
  BT: "Break",
  P: "Penalties",
  LIVE: "Live",
  FT: "Full Time",
  AET: "After Extra Time",
  PEN: "Penalties",
  PST: "Postponed",
  CANC: "Cancelled",
  ABD: "Abandoned",
  AWD: "Awarded",
  WO: "Walkover",
};

const STATUS_CARD_ZH: Record<string, string> = {
  NS: "未开始",
  TBD: "未开始",
  HT: "HT",
  FT: "FT",
  AET: "AET",
  PEN: "PEN",
  PST: "推迟",
  CANC: "取消",
  ABD: "中止",
};

const STATUS_CARD_EN: Record<string, string> = {
  NS: "NS",
  TBD: "TBD",
  HT: "HT",
  FT: "FT",
  AET: "AET",
  PEN: "PEN",
  PST: "PST",
  CANC: "CANC",
  ABD: "ABD",
};

export function formatMatchStatusLong(
  status?: { short?: string | null; long?: string | null },
  locale = "zh"
): string {
  const isZh = locale === "zh";
  const fallback = isZh ? "未开始" : "Not Started";
  const map = isZh ? STATUS_LONG_ZH : STATUS_LONG_EN;

  if (isEmptyStatusValue(status?.short) && isEmptyStatusValue(status?.long)) {
    return fallback;
  }
  const short = normalizeStatusShort(status?.short);
  if (!isEmptyStatusValue(status?.long) && !map[short]) {
    return status!.long!.trim();
  }
  return map[short] ?? fallback;
}

/** 比赛列表卡片左侧状态文案 */
export function formatMatchCardStatusLabel(
  status: { short?: string | null; elapsed?: number | null },
  date: string,
  locale = "zh"
): string {
  const isZh = locale === "zh";
  const cardMap = isZh ? STATUS_CARD_ZH : STATUS_CARD_EN;
  const notStarted = isZh ? "未开始" : "NS";
  const liveLabel = isZh ? "进行中" : "LIVE";

  if (isEmptyStatusValue(status.short)) return notStarted;

  const short = status.short!.trim();
  if (isLiveStatus(short)) {
    return status.elapsed != null ? `${status.elapsed}'` : liveLabel;
  }
  if (short === "FT" || isFinishedStatus(short)) return cardMap[short] ?? "FT";
  if (short === "HT") return "HT";
  if (short === "NS" || short === "TBD") {
    if (date) return formatMatchTime(date, locale);
    return notStarted;
  }
  return cardMap[short] ?? short;
}

export function formatMatchTime(date: string | Date, locale = "en") {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMatchDate(date: string | Date, locale = "en") {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function isLiveStatus(status?: string | null) {
  if (isEmptyStatusValue(status)) return false;
  return ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(status!.trim());
}

export function isFinishedStatus(status?: string | null) {
  if (isEmptyStatusValue(status)) return false;
  return ["FT", "AET", "PEN"].includes(status!.trim());
}
