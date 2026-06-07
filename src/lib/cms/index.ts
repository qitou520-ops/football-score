import "server-only";

import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";
import type { AdItem, NewsItem, PredictionItem, SiteSettings, FeaturedMatchItem } from "./types";
import { AD_POSITION_ALIASES, DEFAULT_SETTINGS } from "./types";
import * as file from "./file-store";

function resolveAdPositions(position: string): string[] {
  const positions = new Set<string>([position]);
  for (const [legacy, modern] of Object.entries(AD_POSITION_ALIASES)) {
    if (position === modern || position === legacy) {
      positions.add(legacy);
      positions.add(modern);
    }
  }
  return [...positions];
}

function mapAd(row: {
  id: string;
  name: string;
  title?: string | null;
  position: string;
  htmlCode: string;
  imageUrl: string | null;
  linkUrl: string | null;
  active: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}): AdItem {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    title: row.title || row.name,
    htmlCode: row.htmlCode,
    imageUrl: row.imageUrl || "",
    linkUrl: row.linkUrl || "",
    active: row.active,
    priority: row.priority,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAds(position?: string): Promise<AdItem[]> {
  if (!shouldUseDatabase()) return file.fileGetAds(position);
  try {
    const positions = position ? resolveAdPositions(position) : undefined;
    const rows = await prisma.adSlot.findMany({
      where: {
        active: true,
        ...(positions ? { position: { in: positions } } : {}),
      },
      orderBy: { priority: "desc" },
    });
    return rows.map(mapAd);
  } catch {
    return file.fileGetAds(position);
  }
}

export async function getAllAds(): Promise<AdItem[]> {
  if (!shouldUseDatabase()) return (await file.fileGetAll()).ads;
  try {
    const rows = await prisma.adSlot.findMany({ orderBy: { priority: "desc" } });
    return rows.map(mapAd);
  } catch {
    return (await file.fileGetAll()).ads;
  }
}

export async function saveAd(data: Partial<AdItem> & { name: string; position: string }): Promise<AdItem> {
  if (!shouldUseDatabase()) return file.fileSaveAd(data as Parameters<typeof file.fileSaveAd>[0]);
  const row = data.id
    ? await prisma.adSlot.update({
        where: { id: data.id },
        data: {
          name: data.name,
          title: data.title || data.name,
          position: data.position,
          htmlCode: data.htmlCode ?? "",
          imageUrl: data.imageUrl || null,
          linkUrl: data.linkUrl || null,
          active: data.active ?? true,
          priority: data.priority ?? 0,
        },
      })
    : await prisma.adSlot.create({
        data: {
          name: data.name,
          title: data.title || data.name,
          position: data.position,
          htmlCode: data.htmlCode ?? "",
          imageUrl: data.imageUrl || null,
          linkUrl: data.linkUrl || null,
          active: data.active ?? true,
          priority: data.priority ?? 0,
        },
      });
  return mapAd(row);
}

export async function deleteAd(id: string) {
  if (!shouldUseDatabase()) return file.fileDeleteAd(id);
  await prisma.adSlot.delete({ where: { id } });
}

export async function getNews(publishedOnly = true): Promise<NewsItem[]> {
  if (!shouldUseDatabase()) return file.fileGetNews(publishedOnly);
  try {
    const rows = await prisma.newsArticle.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { publishedAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      titleZh: r.titleZh,
      excerptZh: r.excerptZh,
      contentZh: r.contentZh,
      coverImage: r.coverImage || "",
      seoTitle: r.seoTitle || "",
      seoDescription: r.seoDescription || "",
      published: r.published,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return file.fileGetNews(publishedOnly);
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  if (!shouldUseDatabase()) return file.fileGetNewsBySlug(slug);
  try {
    const r = await prisma.newsArticle.findUnique({ where: { slug } });
    if (!r || !r.published) return null;
    return {
      id: r.id,
      slug: r.slug,
      titleZh: r.titleZh,
      excerptZh: r.excerptZh,
      contentZh: r.contentZh,
      coverImage: r.coverImage || "",
      seoTitle: r.seoTitle || "",
      seoDescription: r.seoDescription || "",
      published: r.published,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    return file.fileGetNewsBySlug(slug);
  }
}

export async function saveNews(data: Partial<NewsItem> & { titleZh: string }): Promise<NewsItem> {
  if (!shouldUseDatabase()) return file.fileSaveNews(data);
  const payload = {
    slug: data.slug || `news-${Date.now()}`,
    titleEn: data.titleZh,
    titleZh: data.titleZh,
    excerptEn: data.excerptZh || "",
    excerptZh: data.excerptZh || "",
    contentEn: data.contentZh || "",
    contentZh: data.contentZh || "",
    coverImage: data.coverImage || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    published: data.published ?? false,
    publishedAt: data.published ? new Date() : null,
  };
  const r = data.id
    ? await prisma.newsArticle.update({ where: { id: data.id }, data: payload })
    : await prisma.newsArticle.create({ data: payload });
  return {
    id: r.id,
    slug: r.slug,
    titleZh: r.titleZh,
    excerptZh: r.excerptZh,
    contentZh: r.contentZh,
    coverImage: r.coverImage || "",
    seoTitle: r.seoTitle || "",
    seoDescription: r.seoDescription || "",
    published: r.published,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function deleteNews(id: string) {
  if (!shouldUseDatabase()) return file.fileDeleteNews(id);
  await prisma.newsArticle.delete({ where: { id } });
}

export async function getPredictions(publishedOnly = true): Promise<PredictionItem[]> {
  if (!shouldUseDatabase()) return file.fileGetPredictions(publishedOnly);
  try {
    const rows = await prisma.predictionArticle.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { publishedAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      titleZh: r.titleZh,
      excerptZh: r.excerptZh,
      contentZh: r.contentZh,
      coverImage: r.coverImage || "",
      confidence: r.confidence,
      prediction: r.prediction || "",
      matchId: r.matchId,
      published: r.published,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return file.fileGetPredictions(publishedOnly);
  }
}

export async function getPredictionBySlug(slug: string): Promise<PredictionItem | null> {
  if (!shouldUseDatabase()) return file.fileGetPredictionBySlug(slug);
  try {
    const r = await prisma.predictionArticle.findUnique({ where: { slug } });
    if (!r || !r.published) return null;
    return {
      id: r.id,
      slug: r.slug,
      titleZh: r.titleZh,
      excerptZh: r.excerptZh,
      contentZh: r.contentZh,
      coverImage: r.coverImage || "",
      confidence: r.confidence,
      prediction: r.prediction || "",
      matchId: r.matchId,
      published: r.published,
      publishedAt: r.publishedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    return file.fileGetPredictionBySlug(slug);
  }
}

export async function savePrediction(data: Partial<PredictionItem> & { titleZh: string }): Promise<PredictionItem> {
  if (!shouldUseDatabase()) return file.fileSavePrediction(data);
  const payload = {
    slug: data.slug || `pred-${Date.now()}`,
    titleEn: data.titleZh,
    titleZh: data.titleZh,
    excerptEn: data.excerptZh || "",
    excerptZh: data.excerptZh || "",
    contentEn: data.contentZh || "",
    contentZh: data.contentZh || "",
    coverImage: data.coverImage || null,
    confidence: data.confidence ?? 50,
    prediction: data.prediction || null,
    matchId: data.matchId ?? null,
    published: data.published ?? false,
    publishedAt: data.published ? new Date() : null,
  };
  const r = data.id
    ? await prisma.predictionArticle.update({ where: { id: data.id }, data: payload })
    : await prisma.predictionArticle.create({ data: payload });
  return {
    id: r.id,
    slug: r.slug,
    titleZh: r.titleZh,
    excerptZh: r.excerptZh,
    contentZh: r.contentZh,
    coverImage: r.coverImage || "",
    confidence: r.confidence,
    prediction: r.prediction || "",
    matchId: r.matchId,
    published: r.published,
    publishedAt: r.publishedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function deletePrediction(id: string) {
  if (!shouldUseDatabase()) return file.fileDeletePrediction(id);
  await prisma.predictionArticle.delete({ where: { id } });
}

export async function getSettings(): Promise<SiteSettings> {
  if (!shouldUseDatabase()) return file.fileGetSettings();
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      siteName: map.siteName || DEFAULT_SETTINGS.siteName,
      telegramUrl: map.telegramUrl || DEFAULT_SETTINGS.telegramUrl,
      siteDescription: map.siteDescription || DEFAULT_SETTINGS.siteDescription,
    };
  } catch {
    return file.fileGetSettings();
  }
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  if (!shouldUseDatabase()) return file.fileSaveSettings(settings);
  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  return getSettings();
}

export async function getStats() {
  const [ads, news, predictions, featured] = await Promise.all([
    getAllAds(),
    getNews(false),
    getPredictions(false),
    getAllFeaturedMatches(),
  ]);
  return {
    ads: ads.length,
    activeAds: ads.filter((a) => a.active).length,
    news: news.length,
    publishedNews: news.filter((n) => n.published).length,
    predictions: predictions.length,
    publishedPredictions: predictions.filter((p) => p.published).length,
    featuredMatches: featured.length,
    activeFeaturedMatches: featured.filter((f) => f.active).length,
  };
}

export async function getFeaturedMatches(activeOnly = true): Promise<FeaturedMatchItem[]> {
  if (!shouldUseDatabase()) return file.fileGetFeaturedMatches(activeOnly);
  try {
    const rows = await prisma.featuredMatch.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      matchId: r.matchId,
      sortOrder: r.sortOrder,
      active: r.active,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return file.fileGetFeaturedMatches(activeOnly);
  }
}

export async function getAllFeaturedMatches(): Promise<FeaturedMatchItem[]> {
  if (!shouldUseDatabase()) return file.fileGetAllFeaturedMatches();
  try {
    const rows = await prisma.featuredMatch.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((r) => ({
      id: r.id,
      matchId: r.matchId,
      sortOrder: r.sortOrder,
      active: r.active,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch {
    return file.fileGetAllFeaturedMatches();
  }
}

export async function saveFeaturedMatch(
  data: Partial<FeaturedMatchItem> & { matchId: number }
): Promise<FeaturedMatchItem> {
  if (!shouldUseDatabase()) return file.fileSaveFeaturedMatch(data);
  const r = data.id
    ? await prisma.featuredMatch.update({
        where: { id: data.id },
        data: {
          matchId: data.matchId,
          sortOrder: data.sortOrder ?? 0,
          active: data.active ?? true,
        },
      })
    : await prisma.featuredMatch.create({
        data: {
          matchId: data.matchId,
          sortOrder: data.sortOrder ?? 0,
          active: data.active ?? true,
        },
      });
  return {
    id: r.id,
    matchId: r.matchId,
    sortOrder: r.sortOrder,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function deleteFeaturedMatch(id: string) {
  if (!shouldUseDatabase()) return file.fileDeleteFeaturedMatch(id);
  await prisma.featuredMatch.delete({ where: { id } });
}
