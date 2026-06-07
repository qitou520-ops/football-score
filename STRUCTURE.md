# 足球比分网站 — 项目目录结构

> Next.js 15 · TypeScript · Tailwind CSS · Shadcn UI · 中文界面 · Mock 数据（暂不接入 API）

## 路由一览

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 比赛流、日期切换、联赛分组 |
| `/live` | 即时比分 | 同首页比赛流 |
| `/league/[id]` | 联赛 | 重定向至积分榜 |
| `/league/[id]/standings` | 积分榜 | 联赛排名 |
| `/league/[id]/fixtures` | 赛程 | 联赛比赛列表 |
| `/match/[id]` | 比赛详情 | 比分、事件、统计、交锋 |
| `/match/[id]/stats` | 比赛统计 | 技术统计对比 |
| `/team/[id]` | 球队 | 球队信息、赛果、赛程 |
| `/player/[id]` | 球员 | 球员资料、赛季数据 |
| `/news` | 新闻列表 | 足球资讯 |
| `/news/[slug]` | 新闻详情 | 文章正文 |
| `/predictions` | 赛事分析 | 赛前分析列表 |
| `/predictions/[slug]` | 分析详情 | 分析正文 |
| `/search` | 搜索 | 球队/球员搜索 |
| `/admin` | 管理后台 | CMS 管理（可选） |

## 目录树

```
football-scores/
├── data/                          # 本地 CMS 数据（JSON，可选）
│   └── cms.json
├── prisma/                        # 数据库 Schema（后续接入用）
├── public/                        # 静态资源
├── src/
│   ├── app/
│   │   ├── [locale]/              # 国际化路由（默认中文，URL 无前缀）
│   │   │   ├── page.tsx           # ① 首页
│   │   │   ├── live/page.tsx      # ② 即时比分
│   │   │   ├── league/[id]/
│   │   │   │   ├── page.tsx       # ③ 联赛（重定向）
│   │   │   │   ├── standings/page.tsx
│   │   │   │   └── fixtures/page.tsx
│   │   │   ├── team/[id]/page.tsx # ④ 球队
│   │   │   ├── player/[id]/page.tsx # ⑤ 球员
│   │   │   ├── match/[id]/
│   │   │   │   ├── page.tsx       # 比赛详情
│   │   │   │   └── stats/page.tsx
│   │   │   ├── news/              # ⑥ 新闻
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── predictions/       # ⑦ 赛事分析
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── ads/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── loading.tsx
│   │   ├── admin/page.tsx         # 管理后台
│   │   ├── api/                   # API 路由（后续接入用，前端暂不使用）
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ads/                   # 广告组件
│   │   ├── admin/                 # 后台组件
│   │   ├── layout/                # 布局（Header、Footer、PageShell）
│   │   ├── league/                # 联赛（积分榜、导航、侧栏）
│   │   ├── match/                 # 比赛（卡片、Feed、统计、时间线）
│   │   ├── player/                # 球员（数据表）
│   │   ├── search/                # 搜索
│   │   ├── seo/                   # SEO 结构化数据
│   │   └── ui/                    # Shadcn UI 基础组件
│   ├── i18n/                      # next-intl 配置
│   ├── lib/
│   │   ├── data/index.ts          # ★ 统一数据入口（当前 = Mock）
│   │   ├── mock/                  # ★ Mock 数据层
│   │   │   ├── index.ts
│   │   │   ├── leagues.ts         # 联赛
│   │   │   ├── fixtures.ts        # 比赛、积分榜、球队
│   │   │   ├── players.ts         # 球员
│   │   │   ├── news.ts            # 新闻
│   │   │   └── predictions.ts     # 赛事分析
│   │   ├── match/                 # 比赛工具（分组、排序）
│   │   ├── api-football/          # 外部 API 客户端（后续接入）
│   │   ├── cms/                   # CMS 层（后台用）
│   │   ├── seo/                   # SEO 工具
│   │   └── utils.ts
│   └── messages/
│       └── zh.json                # 中文文案
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── STRUCTURE.md                   # 本文件
```

## 数据流（Mock 模式）

```
页面 / 组件
    ↓
@/lib/data          ← 统一入口
    ↓
@/lib/mock          ← Mock 数据（中文）
```

后续接入 Flashscore / API-Football 等 API 时，只需修改 `src/lib/data/index.ts`，页面无需改动。

## 开发命令

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **组件**: Shadcn UI
- **国际化**: next-intl（仅中文）
- **主题**: next-themes（深色/浅色）

## 参考站点

- [Flashscore](https://www.flashscore.com/)
- [Sofascore](https://www.sofascore.com/)
- [Nowgoal](https://www.nowgoal.com/)
