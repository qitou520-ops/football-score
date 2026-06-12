import "server-only";

import {
  getNews as cmsGetNews,
  getNewsBySlug as cmsGetNewsBySlug,
  getPredictions as cmsGetPredictions,
  getPredictionBySlug as cmsGetPredictionBySlug,
  getFeaturedMatches,
} from "@/lib/cms";
import type { NewsItem, PredictionItem } from "@/lib/cms/types";
import type { NewsArticle } from "@/lib/mock/news";
import type { PredictionArticle } from "@/lib/mock/predictions";
import { getFixtureById, getTodayFixtures } from "./fixtures";

function pickLocale<T extends string>(locale: string, zh: T, en: T | undefined | null): T {
  if (locale === "en" && en) return en;
  return zh;
}

function toNewsArticle(item: NewsItem, locale = "zh"): NewsArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: pickLocale(locale, item.titleZh, item.titleEn),
    excerpt: pickLocale(locale, item.excerptZh, item.excerptEn),
    content: pickLocale(locale, item.contentZh, item.contentEn),
    coverImage: item.coverImage,
    category: "news",
    publishedAt: item.publishedAt || item.createdAt,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
  };
}

function toPredictionArticle(item: PredictionItem, locale = "zh"): PredictionArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: pickLocale(locale, item.titleZh, item.titleEn),
    excerpt: pickLocale(locale, item.excerptZh, item.excerptEn),
    content: pickLocale(locale, item.contentZh, item.contentEn),
    coverImage: item.coverImage,
    league: "",
    matchLabel: item.matchId ? `比赛 #${item.matchId}` : "",
    confidence: item.confidence,
    prediction: item.prediction,
    publishedAt: item.publishedAt || item.createdAt,
    matchId: item.matchId,
  };
}

export async function getNews(locale = "zh"): Promise<NewsArticle[]> {
  const items = await cmsGetNews(true);
  if (items.length) return items.map((item) => toNewsArticle(item, locale));
  const mock = await import("@/lib/mock/news");
  return mock.NEWS;
}

export async function getNewsBySlug(slug: string, locale = "zh"): Promise<NewsArticle | null> {
  const item = await cmsGetNewsBySlug(slug);
  if (item) return toNewsArticle(item, locale);
  const mock = await import("@/lib/mock/news");
  return mock.getNewsBySlug(slug);
}

export async function getPredictions(locale = "zh"): Promise<PredictionArticle[]> {
  const items = await cmsGetPredictions(true);
  if (items.length) return items.map((item) => toPredictionArticle(item, locale));
  const mock = await import("@/lib/mock/predictions");
  return mock.PREDICTIONS;
}

export async function getPredictionBySlug(slug: string, locale = "zh"): Promise<PredictionArticle | null> {
  const item = await cmsGetPredictionBySlug(slug);
  if (item) return toPredictionArticle(item, locale);
  const mock = await import("@/lib/mock/predictions");
  return mock.getPredictionBySlug(slug);
}

export async function getFeaturedMatchFixtures() {
  const featured = await getFeaturedMatches(true);
  if (!featured.length) return [];

  const todayFixtures = await getTodayFixtures().catch(() => []);
  const byId = new Map(todayFixtures.map((f) => [f.fixture.id, f]));

  const results = await Promise.all(
    featured.map(async (f) => {
      const cached = byId.get(f.matchId);
      if (cached) return cached;
      return getFixtureById(f.matchId).catch(() => null);
    })
  );
  return results.filter((f): f is NonNullable<typeof f> => f !== null);
}

export type { NewsArticle, PredictionArticle };
