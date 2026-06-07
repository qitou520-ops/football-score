/** API-Football 技术统计字段 → 中英文 */
const STAT_LABELS: Record<string, { zh: string; en: string }> = {
  "Shots on Goal": { zh: "射正", en: "Shots on Goal" },
  "Shots off Goal": { zh: "射偏", en: "Shots off Goal" },
  "Total Shots": { zh: "射门", en: "Total Shots" },
  "Blocked Shots": { zh: "被封堵射门", en: "Blocked Shots" },
  "Shots insidebox": { zh: "禁区内射门", en: "Shots inside box" },
  "Shots outsidebox": { zh: "禁区外射门", en: "Shots outside box" },
  "Fouls": { zh: "犯规", en: "Fouls" },
  "Corner Kicks": { zh: "角球", en: "Corner Kicks" },
  "Offsides": { zh: "越位", en: "Offsides" },
  "Ball Possession": { zh: "控球率", en: "Ball Possession" },
  "Yellow Cards": { zh: "黄牌", en: "Yellow Cards" },
  "Red Cards": { zh: "红牌", en: "Red Cards" },
  "Goalkeeper Saves": { zh: "扑救", en: "Goalkeeper Saves" },
  "Total passes": { zh: "传球", en: "Total passes" },
  "Passes accurate": { zh: "成功传球", en: "Passes accurate" },
  "Passes %": { zh: "传球成功率", en: "Pass accuracy" },
  "expected_goals": { zh: "预期进球", en: "Expected goals" },
  "goals_prevented": { zh: "阻止进球", en: "Goals prevented" },
};

export function translateStatType(type: string, locale: string): string {
  const entry = STAT_LABELS[type];
  if (!entry) return type;
  return locale === "zh" ? entry.zh : entry.en;
}
