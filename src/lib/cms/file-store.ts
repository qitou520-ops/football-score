import { promises as fs } from "fs";
import path from "path";
import type {
  AdItem,
  AffiliateLinkItem,
  CmsData,
  NewsItem,
  PredictionItem,
  SiteSettings,
  FeaturedMatchItem,
} from "./types";
import { DEFAULT_SETTINGS, newId } from "./types";
import { sanitizeAdHtml } from "@/lib/sanitize/ad-html";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "cms.json");

const EMPTY: CmsData = {
  ads: [],
  news: [],
  predictions: [],
  featuredMatches: [],
  affiliateLinks: [],
  settings: { ...DEFAULT_SETTINGS },
};

async function ensureFile(): Promise<CmsData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as CmsData;
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY, null, 2), "utf-8");
    return { ...EMPTY };
  }
}

async function save(data: CmsData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function fileGetAll(): Promise<CmsData> {
  return ensureFile();
}

import { AD_POSITION_ALIASES } from "./types";

export async function fileGetAds(position?: string): Promise<AdItem[]> {
  const data = await ensureFile();
  const positions = position
    ? new Set([
        position,
        AD_POSITION_ALIASES[position],
        ...Object.entries(AD_POSITION_ALIASES)
          .filter(([, v]) => v === position)
          .map(([k]) => k),
      ].filter(Boolean) as string[])
    : null;
  return data.ads
    .filter((a) => a.active && (!positions || positions.has(a.position)))
    .sort((a, b) => b.priority - a.priority)
    .map((ad) => ({ ...ad, htmlCode: sanitizeAdHtml(ad.htmlCode) }));
}

export async function fileSaveAd(ad: Omit<AdItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<AdItem> {
  const data = await ensureFile();
  const now = new Date().toISOString();
  if (ad.id) {
    const idx = data.ads.findIndex((a) => a.id === ad.id);
    if (idx >= 0) {
      data.ads[idx] = { ...data.ads[idx], ...ad, updatedAt: now };
      await save(data);
      return data.ads[idx];
    }
  }
  const item: AdItem = {
    id: newId(),
    name: ad.name,
    position: ad.position,
    title: ad.title || ad.name,
    htmlCode: ad.htmlCode || "",
    imageUrl: ad.imageUrl || "",
    linkUrl: ad.linkUrl || "",
    active: ad.active ?? true,
    priority: ad.priority ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  data.ads.push(item);
  await save(data);
  return item;
}

export async function fileDeleteAd(id: string) {
  const data = await ensureFile();
  data.ads = data.ads.filter((a) => a.id !== id);
  await save(data);
}

export async function fileGetNews(publishedOnly = false): Promise<NewsItem[]> {
  const data = await ensureFile();
  return data.news
    .filter((n) => !publishedOnly || n.published)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export async function fileGetNewsBySlug(slug: string): Promise<NewsItem | null> {
  const data = await ensureFile();
  return data.news.find((n) => n.slug === slug && n.published) ?? null;
}

export async function fileSaveNews(item: Partial<NewsItem> & { titleZh: string }): Promise<NewsItem> {
  const data = await ensureFile();
  const now = new Date().toISOString();
  if (item.id) {
    const idx = data.news.findIndex((n) => n.id === item.id);
    if (idx >= 0) {
      data.news[idx] = {
        ...data.news[idx],
        ...item,
        updatedAt: now,
        publishedAt: item.published ? item.publishedAt || now : null,
      };
      await save(data);
      return data.news[idx];
    }
  }
  const news: NewsItem = {
    id: newId(),
    slug: item.slug || `news-${Date.now()}`,
    titleZh: item.titleZh,
    excerptZh: item.excerptZh || "",
    contentZh: item.contentZh || "",
    coverImage: item.coverImage || "",
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || "",
    published: item.published ?? false,
    publishedAt: item.published ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  data.news.push(news);
  await save(data);
  return news;
}

export async function fileDeleteNews(id: string) {
  const data = await ensureFile();
  data.news = data.news.filter((n) => n.id !== id);
  await save(data);
}

export async function fileGetPredictions(publishedOnly = false): Promise<PredictionItem[]> {
  const data = await ensureFile();
  return data.predictions
    .filter((p) => !publishedOnly || p.published)
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
}

export async function fileGetPredictionBySlug(slug: string): Promise<PredictionItem | null> {
  const data = await ensureFile();
  return data.predictions.find((p) => p.slug === slug && p.published) ?? null;
}

export async function fileSavePrediction(item: Partial<PredictionItem> & { titleZh: string }): Promise<PredictionItem> {
  const data = await ensureFile();
  const now = new Date().toISOString();
  if (item.id) {
    const idx = data.predictions.findIndex((p) => p.id === item.id);
    if (idx >= 0) {
      data.predictions[idx] = {
        ...data.predictions[idx],
        ...item,
        updatedAt: now,
        publishedAt: item.published ? item.publishedAt || now : null,
      };
      await save(data);
      return data.predictions[idx];
    }
  }
  const pred: PredictionItem = {
    id: newId(),
    slug: item.slug || `pred-${Date.now()}`,
    titleZh: item.titleZh,
    excerptZh: item.excerptZh || "",
    contentZh: item.contentZh || "",
    coverImage: item.coverImage || "",
    confidence: item.confidence ?? 50,
    prediction: item.prediction || "",
    matchId: item.matchId ?? null,
    published: item.published ?? false,
    publishedAt: item.published ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  data.predictions.push(pred);
  await save(data);
  return pred;
}

export async function fileDeletePrediction(id: string) {
  const data = await ensureFile();
  data.predictions = data.predictions.filter((p) => p.id !== id);
  await save(data);
}

export async function fileGetSettings(): Promise<SiteSettings> {
  const data = await ensureFile();
  return { ...DEFAULT_SETTINGS, ...data.settings };
}

export async function fileSaveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const data = await ensureFile();
  data.settings = { ...data.settings, ...settings };
  await save(data);
  return data.settings;
}

export async function fileGetFeaturedMatches(activeOnly = false): Promise<FeaturedMatchItem[]> {
  const data = await ensureFile();
  return (data.featuredMatches ?? [])
    .filter((m) => !activeOnly || m.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fileGetAllFeaturedMatches(): Promise<FeaturedMatchItem[]> {
  const data = await ensureFile();
  return (data.featuredMatches ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fileSaveFeaturedMatch(
  item: Partial<FeaturedMatchItem> & { matchId: number }
): Promise<FeaturedMatchItem> {
  const data = await ensureFile();
  if (!data.featuredMatches) data.featuredMatches = [];
  const now = new Date().toISOString();
  if (item.id) {
    const idx = data.featuredMatches.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      data.featuredMatches[idx] = { ...data.featuredMatches[idx], ...item, updatedAt: now };
      await save(data);
      return data.featuredMatches[idx];
    }
  }
  const row: FeaturedMatchItem = {
    id: newId(),
    matchId: item.matchId,
    sortOrder: item.sortOrder ?? data.featuredMatches.length,
    active: item.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  data.featuredMatches.push(row);
  await save(data);
  return row;
}

export async function fileDeleteFeaturedMatch(id: string) {
  const data = await ensureFile();
  data.featuredMatches = (data.featuredMatches ?? []).filter((m) => m.id !== id);
  await save(data);
}

export async function fileGetAffiliateLinks(): Promise<AffiliateLinkItem[]> {
  const data = await ensureFile();
  return (data.affiliateLinks ?? []).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function fileGetAffiliateBySlug(slug: string): Promise<AffiliateLinkItem | null> {
  const data = await ensureFile();
  return (data.affiliateLinks ?? []).find((l) => l.slug === slug && l.active) ?? null;
}

export async function fileSaveAffiliateLink(
  link: Partial<AffiliateLinkItem> & { name: string; slug: string; destination: string }
): Promise<AffiliateLinkItem> {
  const data = await ensureFile();
  if (!data.affiliateLinks) data.affiliateLinks = [];
  const now = new Date().toISOString();
  if (link.id) {
    const idx = data.affiliateLinks.findIndex((l) => l.id === link.id);
    if (idx >= 0) {
      data.affiliateLinks[idx] = {
        ...data.affiliateLinks[idx],
        ...link,
        partner: link.partner ?? data.affiliateLinks[idx].partner,
        updatedAt: now,
      };
      await save(data);
      return data.affiliateLinks[idx];
    }
  }
  const row: AffiliateLinkItem = {
    id: newId(),
    name: link.name,
    slug: link.slug,
    destination: link.destination,
    partner: link.partner ?? "partner",
    active: link.active ?? true,
    clicks: link.clicks ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  data.affiliateLinks.push(row);
  await save(data);
  return row;
}

export async function fileTrackAffiliateClick(slug: string): Promise<string | null> {
  const data = await ensureFile();
  const idx = (data.affiliateLinks ?? []).findIndex((l) => l.slug === slug && l.active);
  if (idx < 0) return null;
  data.affiliateLinks[idx].clicks += 1;
  data.affiliateLinks[idx].updatedAt = new Date().toISOString();
  await save(data);
  return data.affiliateLinks[idx].destination;
}

export async function fileDeleteAffiliateLink(id: string) {
  const data = await ensureFile();
  data.affiliateLinks = (data.affiliateLinks ?? []).filter((l) => l.id !== id);
  await save(data);
}
