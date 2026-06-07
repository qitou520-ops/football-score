/** 常见联赛英文名 → 中文（精确匹配，优先于机器翻译） */
const LEAGUE_EXACT: Record<string, string> = {
  "J2/J3 League": "日职J2/J3联赛",
  "J2 League": "日职乙",
  "J3 League": "日职丙",
  "J1 League": "日职联",
  "USL League Two": "美国USL联赛二",
  "USL League One": "美国USL联赛一",
  "USL Championship": "美国USL冠军联赛",
  "Queensland Premier League": "昆士兰超级联赛",
  "Queensland NPL": "昆士兰国家超级联赛",
  "A-League": "澳超",
  "A-League Men": "澳超",
  "FA Cup": "足总杯",
  "EFL Cup": "联赛杯",
  "Carabao Cup": "联赛杯",
  "Community Shield": "社区盾",
  "Copa del Rey": "国王杯",
  "DFB Pokal": "德国杯",
  "Coppa Italia": "意大利杯",
  "Coupe de France": "法国杯",
  "UEFA Nations League": "欧国联",
  "CONCACAF Champions Cup": "中北美冠军杯",
  "Copa Libertadores": "南美解放者杯",
  "Copa Sudamericana": "南美俱乐部杯",
  "AFC Champions League": "亚冠",
  "AFC Champions League Elite": "亚冠精英联赛",
};

/** 关键词替换（用于生成可读中文联赛名） */
const LEAGUE_KEYWORDS: [RegExp, string][] = [
  [/Premier League/i, "超级联赛"],
  [/First Division/i, "甲级联赛"],
  [/Second Division/i, "乙级联赛"],
  [/Third Division/i, "丙级联赛"],
  [/Division\s*1/i, "甲级联赛"],
  [/Division\s*2/i, "乙级联赛"],
  [/National League/i, "国家联赛"],
  [/Championship/i, "冠军联赛"],
  [/League One/i, "甲级联赛"],
  [/League Two/i, "乙级联赛"],
  [/Cup/i, "杯"],
  [/Super League/i, "超级联赛"],
  [/Liga/i, "联赛"],
];

const COUNTRY_PREFIX: Record<string, string> = {
  Queensland: "昆士兰",
  Victoria: "维多利亚",
  "New South Wales": "新南威尔士",
  Tasmania: "塔斯马尼亚",
  "South Australia": "南澳大利亚",
  "Western Australia": "西澳大利亚",
  Japanese: "日本",
  Japan: "日本",
  Korean: "韩国",
  Korea: "韩国",
  Chinese: "中国",
  China: "中国",
  American: "美国",
  USA: "美国",
  US: "美国",
  Australian: "澳大利亚",
  Australia: "澳大利亚",
  Scottish: "苏格兰",
  Scotland: "苏格兰",
  English: "英格兰",
  England: "英格兰",
  Spanish: "西班牙",
  Spain: "西班牙",
  German: "德国",
  Germany: "德国",
  French: "法国",
  France: "法国",
  Italian: "意大利",
  Italy: "意大利",
  Brazilian: "巴西",
  Brazil: "巴西",
  Mexican: "墨西哥",
  Mexico: "墨西哥",
  Turkish: "土耳其",
  Turkey: "土耳其",
  Portuguese: "葡萄牙",
  Portugal: "葡萄牙",
  Dutch: "荷兰",
  Netherlands: "荷兰",
  Belgian: "比利时",
  Belgium: "比利时",
};

export function translateLeagueByPattern(name: string): string | null {
  if (LEAGUE_EXACT[name]) return LEAGUE_EXACT[name];

  for (const [country, zh] of Object.entries(COUNTRY_PREFIX)) {
    if (name.startsWith(country + " ")) {
      let rest = name.slice(country.length + 1);
      for (const [re, rep] of LEAGUE_KEYWORDS) {
        rest = rest.replace(re, rep);
      }
      return zh + rest;
    }
  }

  for (const [re, rep] of LEAGUE_KEYWORDS) {
    if (re.test(name)) {
      return name.replace(re, rep);
    }
  }

  return null;
}
