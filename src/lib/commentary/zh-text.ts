/** 文字直播固定中文文案（不随站点语言切换） */
export const COMMENTARY_ZH_LABELS = {
  title: "文字直播",
  live: "进行中",
  updating: "更新中…",
  empty: "暂无文字直播数据",
  goal: "进球",
  yellowCard: "黄牌",
  redCard: "红牌",
  substitution: "换人",
  var: "VAR",
  assist: "助攻",
  in: "换上",
  out: "换下",
} as const;

const DETAIL_ZH: Record<string, string> = {
  "Normal Goal": "普通进球",
  "Own Goal": "乌龙球",
  Penalty: "点球",
  "Missed Penalty": "点球未进",
  "Yellow Card": "黄牌",
  "Red Card": "红牌",
  "Second Yellow card": "两黄变一红",
  "Substitution 1": "换人",
  "Substitution 2": "换人",
  "Substitution 3": "换人",
  "Substitution 4": "换人",
  "Substitution 5": "换人",
  "Goal cancelled": "进球取消",
  "Penalty confirmed": "点球确认",
  "Penalty Cancelled": "点球取消",
  "Goal Disallowed - offside": "进球无效（越位）",
  "Goal Disallowed - handball": "进球无效（手球）",
  "Goal Disallowed - foul": "进球无效（犯规）",
  "Goal confirmed": "进球有效",
  "Card upgrade": "黄牌改红牌",
  "Card reviewed": "卡牌复核",
  "Red card cancelled": "红牌取消",
  "Goal under review": "进球复核中",
  "Penalty awarded": "判罚点球",
  "No penalty": "未判罚点球",
  "Goal Awarded": "进球有效",
  "Goal Not Awarded": "进球无效",
  "Penalty Awarded": "判罚点球",
  "Penalty Not Awarded": "未判罚点球",
  "Card reviewed - red card": "复核红牌",
  "Card reviewed - no card": "复核后无牌",
  "Offside": "越位",
  Foul: "犯规",
  Handball: "手球",
};

const TYPE_ZH: Record<string, string> = {
  Goal: "进球",
  Card: "黄牌/红牌",
  subst: "换人",
  Var: "VAR 介入",
};

const COMMENT_PATTERNS: [RegExp, string][] = [
  [/offside/i, "越位"],
  [/penalty/i, "点球"],
  [/foul/i, "犯规"],
  [/handball/i, "手球"],
  [/goal/i, "进球"],
  [/red card/i, "红牌"],
  [/yellow card/i, "黄牌"],
  [/substitution/i, "换人"],
  [/cancelled|canceled/i, "取消"],
  [/confirmed/i, "确认"],
  [/awarded/i, "判罚"],
  [/disallowed/i, "无效"],
  [/review/i, "复核"],
];

function normalizeKey(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** API 事件 detail / comments 转中文 */
export function translateCommentaryDetail(raw: string | null | undefined): string {
  if (raw == null || raw === "null" || raw === "undefined") return "";
  const text = normalizeKey(String(raw));
  if (!text) return "";

  if (DETAIL_ZH[text]) return DETAIL_ZH[text];

  const lower = text.toLowerCase();
  for (const [key, zh] of Object.entries(DETAIL_ZH)) {
    if (key.toLowerCase() === lower) return zh;
  }

  for (const [pattern, zh] of COMMENT_PATTERNS) {
    if (pattern.test(text)) return zh;
  }

  // 已是中文则保留
  if (/[\u4e00-\u9fff]/.test(text)) return text;

  return "";
}

export function translateCommentaryEventType(type: string | null | undefined): string {
  if (!type) return "";
  const key = normalizeKey(type);
  return TYPE_ZH[key] ?? TYPE_ZH[key.toLowerCase()] ?? "";
}
