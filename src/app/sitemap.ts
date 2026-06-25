import type { MetadataRoute } from "next";
import { LANG_PAGE_LIST } from "@/lib/languagePages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://quickplay.fun";

export default function sitemap(): MetadataRoute.Sitemap {
  const langPages = LANG_PAGE_LIST.map((p) => ({
    url: `${BASE}/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/submit`, changeFrequency: "monthly", priority: 0.5 },
    ...langPages,
  ];
}
