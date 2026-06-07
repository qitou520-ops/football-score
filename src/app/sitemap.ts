import type { MetadataRoute } from "next";
import { POPULAR_LEAGUES } from "@/lib/api-football/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/live", "/news", "/predictions", "/search"];
  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${SITE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" || page === "/live" ? "always" : "daily",
    priority: page === "" ? 1 : 0.8,
  }));

  for (const league of POPULAR_LEAGUES) {
    entries.push({
      url: `${SITE_URL}/league/${league.id}/standings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
    entries.push({
      url: `${SITE_URL}/league/${league.id}/fixtures`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  return entries;
}
