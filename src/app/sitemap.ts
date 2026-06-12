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

  const leagueTabs = ["fixtures", "standings", "players", "teams"] as const;
  for (const league of POPULAR_LEAGUES) {
    for (const tab of leagueTabs) {
      entries.push({
        url: `${SITE_URL}/league/${league.id}/${tab}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: league.id === 1 ? 0.85 : 0.7,
      });
    }
  }

  return entries;
}
