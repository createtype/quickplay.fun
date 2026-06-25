import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://quickplay.fun";

// Allow everyone, incl. AI crawlers (so ChatGPT/Perplexity/Claude/Gemini can cite us).
// Keep app-only routes out of the index; they aren't useful as search landings.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/play", "/result", "/room/", "/s/", "/admin"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
