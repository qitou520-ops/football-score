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
import { getFixtureById } from "./fixtures";

function toNewsArticle(item: NewsItem): NewsArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: item.titleZh,
    excerpt: item.excerptZh,
    content: item.contentZh,
    coverImage: item.coverImage,
    category: "news",
    publishedAt: item.publishedAt || item.createdAt,
    seoTitle: item.seoTitle,
    seoDescription: item.seoDescription,
  };
}

function toPredictionArticle(item: PredictionItem): PredictionArticle {
  return {
    id: item.id,
    slug: item.slug,
    title: item.titleZh,
    excerpt: item.excerptZh,
    content: item.contentZh,
    coverImage: item.coverImage,
    league: "",
    matchLabel: item.matchId ? `比赛 #${item.matchId}` : "",
    confidence: item.confidence,
    prediction: item.prediction,
    publishedAt: item.publishedAt || item.createdAt,
    matchId: item.matchId,
  };
}

export async function getNews(): Promise<NewsArticle[]> {
  const items = await cmsGetNews(true);
  if (items.length) return items.map(toNewsArticle);
  const mock = await import("@/lib/mock/news");
  return mock.NEWS;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const item = await cmsGetNewsBySlug(slug);
  if (item) return toNewsArticle(item);
  const mock = await import("@/lib/mock/news");
  return mock.getNewsBySlug(slug);
}

export async function getPredictions(): Promise<PredictionArticle[]> {
  const items = await cmsGetPredictions(true);
  if (items.length) return items.map(toPredictionArticle);
  const mock = await import("@/lib/mock/predictions");
  return mock.PREDICTIONS;
}

export async function getPredictionBySlug(slug: string): Promise<PredictionArticle | null> {
  const item = await cmsGetPredictionBySlug(slug);
  if (item) return toPredictionArticle(item);
  const mock = await import("@/lib/mock/predictions");
  return mock.getPredictionBySlug(slug);
}

export async function getFeaturedMatchFixtures() {
  const featured = await getFeaturedMatches(true);
  const fixtures = await Promise.all(
    featured.map((f) => getFixtureById(f.matchId).catch(() => null))
  );
  return fixtures.filter((f): f is NonNullable<typeof f> => f !== null);
}

export type { NewsArticle, PredictionArticle };
