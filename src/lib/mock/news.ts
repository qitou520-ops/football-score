export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export const NEWS: NewsArticle[] = [
  {
    id: "1",
    slug: "premier-league-title-race",
    title: "英超争冠形势：五场定乾坤",
    excerpt: "剩余五轮联赛，积分榜前三球队争冠走势全解析。",
    content: "随着赛季进入最后五轮，英超争冠已进入白热化阶段。\n\n曼城、阿森纳和利物浦分差仅在个位数，每一场比赛的结果都可能改变最终走势。从近期状态来看，曼城进攻火力稳定，阿森纳防守韧性十足，利物浦则依靠快速反击保持威胁。\n\n接下来我们将从赛程难度、伤病情况、主客场优势等维度，为您全面解读争冠形势。",
    coverImage: "",
    category: "英超",
    publishedAt: "2025-05-30T08:00:00.000Z",
  },
  {
    id: "2",
    slug: "champions-league-semi-finals",
    title: "欧冠半决赛前瞻：四支豪门谁能晋级？",
    excerpt: "欧洲顶级赛事进入关键阶段，战术博弈成为胜负关键。",
    content: "欧冠半决赛即将打响，四支欧洲顶级豪门将展开两回合较量。\n\n皇马与曼城再次相遇，控球与反击的碰撞值得期待；巴萨与拜仁则代表两种不同风格的巅峰对决。\n\n半决赛往往更加谨慎，定位球与防守细节将成为破局关键。",
    coverImage: "",
    category: "欧冠",
    publishedAt: "2025-05-29T08:00:00.000Z",
  },
  {
    id: "3",
    slug: "transfer-window-preview",
    title: "夏季转会窗前瞻：各队补强计划",
    excerpt: "豪门引援目标浮出水面，中游球队寻求保级与突破。",
    content: "2025夏季转会窗即将开启，英超各队已制定明确的引援计划。\n\n曼城可能继续补强中场深度，曼联则急需稳定后防线，切尔西年轻化战略仍在推进。\n\n西甲方面，皇马在姆巴佩加盟后可能调整锋线配置，巴萨则继续推行财政公平下的精明引援。",
    coverImage: "",
    category: "转会",
    publishedAt: "2025-05-28T08:00:00.000Z",
  },
  {
    id: "4",
    slug: "la-liga-relegation-battle",
    title: "西甲保级大战：三队争夺一线生机",
    excerpt: "联赛末段保级形势扑朔迷离，每分都至关重要。",
    content: "西甲保级区竞争进入最后冲刺，三支球队积分纠缠，任何一场失利都可能导致降级。\n\n主场优势与赛程难度将直接影响最终排名，末轮往往充满悬念。",
    coverImage: "",
    category: "西甲",
    publishedAt: "2025-05-27T08:00:00.000Z",
  },
];

export function getNews() {
  return NEWS;
}

export function getNewsBySlug(slug: string) {
  return NEWS.find((n) => n.slug === slug) ?? null;
}
