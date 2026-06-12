import { z } from "zod";
import { AD_POSITIONS } from "@/lib/cms/types";

const adPositions = AD_POSITIONS.map((p) => p.id) as [string, ...string[]];

export const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const adSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "广告名称不能为空"),
  title: z.string().optional(),
  position: z.union([z.enum(adPositions), z.string().min(1)]),
  htmlCode: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  active: z.boolean().optional(),
  priority: z.number().int().optional(),
});

export const newsSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  titleZh: z.string().min(1, "标题不能为空"),
  excerptZh: z.string().optional(),
  contentZh: z.string().optional(),
  coverImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().optional(),
});

export const predictionSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  titleZh: z.string().min(1, "标题不能为空"),
  excerptZh: z.string().optional(),
  contentZh: z.string().optional(),
  coverImage: z.string().optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  prediction: z.string().optional(),
  matchId: z.number().int().positive().optional().nullable(),
  published: z.boolean().optional(),
});

export const featuredMatchSchema = z.object({
  id: z.string().optional(),
  matchId: z.number().int().positive("比赛 ID 必须为正整数"),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  telegramUrl: z.string().optional(),
  partnerUrl: z.union([z.string().url(), z.literal("")]).optional(),
});
