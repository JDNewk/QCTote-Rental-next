import type { MetadataRoute } from "next";
import { serviceAreas } from "@/config/serviceAreas";
import { getSitemapArticles } from "@/lib/articles";

type SitemapArticle = Awaited<ReturnType<typeof getSitemapArticles>>[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://qctoterentals.com";

  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/moving-boxes`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/service-area`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/reserve`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/agreement`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const cityPages: MetadataRoute.Sitemap = serviceAreas.map((area) => ({
    url: `${baseUrl}/${area.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articles = await getSitemapArticles();
  const articlePages: MetadataRoute.Sitemap = articles.map((article: SitemapArticle) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(article.slug!)}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...corePages, ...cityPages, ...articlePages];
}
