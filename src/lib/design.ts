/**
 * 全站设计规范 — 专业体育比分网站
 * 圆角 / 阴影 / 间距 / 字体 / 按钮 统一由此导出
 */
export const ds = {
  /** 卡片容器 */
  card: "rounded-[var(--radius-lg)] border border-border bg-card text-card-foreground shadow-[var(--shadow-card)]",
  cardHeader: "flex flex-col gap-1 px-4 py-3 border-b border-border",
  cardBody: "p-4",
  cardBodyFlush: "p-0",

  /** 面板（比赛分组等） */
  panel: "rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden",

  /** 交互卡片 */
  cardInteractive:
    "rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)] hover:border-foreground/15 transition-colors",

  /** 排版 */
  pageTitle: "text-xl md:text-2xl font-bold tracking-tight text-foreground",
  sectionTitle: "text-sm font-bold text-foreground",
  body: "text-sm text-foreground",
  caption: "text-xs text-muted-foreground",
  score: "font-mono font-bold tabular-nums tracking-tight",

  /** 间距 */
  pageY: "py-4 md:py-5",
  pageX: "px-4",
  stack: "space-y-4",
  stackSm: "space-y-3",
  gridGap: "gap-4 md:gap-5",

  /** 圆角 */
  radiusSm: "rounded-[var(--radius-sm)]",
  radiusMd: "rounded-[var(--radius-md)]",
  radiusLg: "rounded-[var(--radius-lg)]",
  radiusFull: "rounded-full",

  /** 按钮形 pill / 筛选 */
  pill: "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
  pillActive: "bg-foreground text-background border-foreground",
  pillInactive: "bg-card text-foreground border-border hover:bg-muted",

  /** 顶栏 / 底栏 */
  header: "sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90",
  bottomNav: "fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90",

  /** 搜索框 */
  searchBar:
    "flex items-center gap-2.5 rounded-full border border-border bg-muted/60 px-4 py-2 text-sm transition-colors hover:bg-muted",

  /** 列表行 */
  listRow:
    "flex items-center gap-3 px-4 py-3 border-t border-border/60 first:border-t-0 hover:bg-muted/40 transition-colors",

  /** 状态标签 */
  liveBadge:
    "inline-flex items-center gap-1 text-[11px] font-bold text-[var(--live)] bg-[var(--live-muted)] px-2 py-0.5 rounded-[var(--radius-sm)]",

  /** 统计数字卡片 */
  statBox: "rounded-[var(--radius-lg)] border border-border bg-card shadow-[var(--shadow-card)] p-4 text-center",

  /** 列表项 / 搜索结果 */
  listItem:
    "flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-border bg-card hover:bg-muted/40 transition-colors",

  /** 时间轴事件卡片 */
  eventCard:
    "rounded-[var(--radius-md)] border border-border bg-card p-3 shadow-[var(--shadow-card)] border-l-[3px]",

  /** 后台列表行 */
  adminRow:
    "flex items-center justify-between gap-2 p-3 rounded-[var(--radius-md)] border border-border bg-card",
} as const;
