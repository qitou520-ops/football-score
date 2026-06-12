export const AD_POSITIONS = [
  { id: "homepage-top", label: "首页顶部" },
  { id: "homepage-sidebar", label: "首页右侧" },
  { id: "match-list-middle", label: "比赛列表中间" },
  { id: "match-detail", label: "比赛详情页" },
] as const;

/** 兼容旧广告位 ID */
export const AD_POSITION_ALIASES: Record<string, string> = {
  "homepage-banner": "homepage-top",
  "sidebar-top": "homepage-sidebar",
  "sidebar-bottom": "homepage-sidebar",
  "mobile-banner": "homepage-top",
  "match-sidebar": "match-detail",
  "ads-page": "homepage-top",
};

export type AdPosition = (typeof AD_POSITIONS)[number]["id"];

export interface AdItem {
  id: string;
  name: string;
  position: string;
  title: string;
  htmlCode: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  titleZh: string;
  titleEn?: string;
  excerptZh: string;
  excerptEn?: string;
  contentZh: string;
  contentEn?: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionItem {
  id: string;
  slug: string;
  titleZh: string;
  titleEn?: string;
  excerptZh: string;
  excerptEn?: string;
  contentZh: string;
  contentEn?: string;
  coverImage: string;
  confidence: number;
  prediction: string;
  matchId: number | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedMatchItem {
  id: string;
  matchId: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  telegramUrl: string;
  siteDescription: string;
  partnerUrl: string;
}

export interface AffiliateLinkItem {
  id: string;
  name: string;
  slug: string;
  destination: string;
  partner: string;
  active: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsData {
  ads: AdItem[];
  news: NewsItem[];
  predictions: PredictionItem[];
  featuredMatches: FeaturedMatchItem[];
  affiliateLinks: AffiliateLinkItem[];
  settings: SiteSettings;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "极速比分",
  telegramUrl: "",
  siteDescription: "专业的足球即时比分平台",
  partnerUrl: "https://hga050h.com",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `item-${Date.now()}`;
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
