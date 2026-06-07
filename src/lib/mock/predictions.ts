export interface PredictionArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  confidence: number;
  prediction: string;
  league: string;
  matchLabel: string;
  publishedAt: string;
  matchId?: number | null;
}

export const PREDICTIONS: PredictionArticle[] = [
  {
    id: "1",
    slug: "city-vs-arsenal-preview",
    title: "曼城 vs 阿森纳 赛前分析",
    excerpt: "英超争冠关键战，两队战术风格与近期状态深度解读。",
    content: "本场比赛是本赛季英超争冠的天王山之战。\n\n曼城主场作战，控球与渗透能力出色，哈兰德状态火热；阿森纳反击速度快，萨卡与厄德高连线是其主要得分手段。\n\n从历史交锋来看，双方近五次交手各有胜负。综合考虑近期状态与主客场因素，主队略占上风。",
    confidence: 72,
    prediction: "主队小胜",
    league: "英超",
    matchLabel: "曼城 vs 阿森纳",
    publishedAt: "2025-05-30T10:00:00.000Z",
  },
  {
    id: "2",
    slug: "el-clasico-preview",
    title: "国家德比前瞻：皇马 vs 巴萨",
    excerpt: "西甲焦点大战，进攻火力与中场控制将成为胜负关键。",
    content: "国家德比永远是世界足坛最受瞩目的比赛之一。\n\n皇马近期进攻效率稳定，姆巴佩与贝林厄姆状态火热；巴萨则依靠年轻球员的活力在中场占据主动。\n\n预计双方都会采取积极进攻策略，比赛进球数可能较多。",
    confidence: 65,
    prediction: "双方均有进球",
    league: "西甲",
    matchLabel: "皇马 vs 巴萨",
    publishedAt: "2025-05-29T10:00:00.000Z",
  },
  {
    id: "3",
    slug: "bayern-vs-dortmund-preview",
    title: "德甲国家德比：拜仁 vs 多特",
    excerpt: "德国国家德比，南大王能否延续主场优势？",
    content: "拜仁与多特蒙德的交锋从不缺乏看点。\n\n拜仁整体实力占优，但多特客场反击能力不容小觑。本赛季多特在关键战中多次爆冷，本场需防平局。",
    confidence: 68,
    prediction: "主队不败",
    league: "德甲",
    matchLabel: "拜仁 vs 多特蒙德",
    publishedAt: "2025-05-28T10:00:00.000Z",
  },
  {
    id: "4",
    slug: "inter-vs-milan-preview",
    title: "米兰德比：国际米兰 vs AC米兰",
    excerpt: "意甲德比战，同城死敌狭路相逢。",
    content: "米兰德比历来火药味十足。国际米兰本赛季防守稳固，AC米兰进攻端更具创造力。\n\n双方近期状态相当，主场因素可能成为决定性因素。",
    confidence: 60,
    prediction: "平局",
    league: "意甲",
    matchLabel: "国际米兰 vs AC米兰",
    publishedAt: "2025-05-27T10:00:00.000Z",
  },
];

export function getPredictions() {
  return PREDICTIONS;
}

export function getPredictionBySlug(slug: string) {
  return PREDICTIONS.find((p) => p.slug === slug) ?? null;
}
