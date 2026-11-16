import { cache } from "react";
import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  normalizeArticleImageUrl,
  normalizeArticleImageUrlsInHtml,
} from "@/lib/articleImageUrls";

function normalizeArticleImages<T extends { imageUrl?: string | null; contentHtml?: string | null }>(
  article: T,
): T {
  return {
    ...article,
    ...(Object.prototype.hasOwnProperty.call(article, "imageUrl")
      ? { imageUrl: normalizeArticleImageUrl(article.imageUrl) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(article, "contentHtml")
      ? { contentHtml: normalizeArticleImageUrlsInHtml(article.contentHtml) }
      : {}),
  };
}

export async function getArticleList() {
  await connection();
  const articles = await getPrisma().article.findMany({
    where: { slug: { not: null }, publishedAt: { lte: new Date() } },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    select: { slug: true, title: true, subtitle: true, metaDescription: true, category: true, imageUrl: true, readTime: true, publishedAt: true },
  });

  return articles.map(normalizeArticleImages);
}

export const getArticleBySlug = cache(async (slug: string) => {
  await connection();
  const article = await getPrisma().article.findFirst({
    where: { slug, publishedAt: { lte: new Date() } },
  });

  return article ? normalizeArticleImages(article) : null;
});

export async function getSitemapArticles() {
  await connection();
  return getPrisma().article.findMany({
    where: { slug: { not: null }, publishedAt: { lte: new Date() } },
    orderBy: { updatedAt: "desc" },
    select: { slug: true, updatedAt: true },
  });
}

export function formatArticleDate(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Chicago" });
}

export function parseJsonLd(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}
