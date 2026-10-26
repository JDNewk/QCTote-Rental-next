import { cache } from "react";
import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Articles are read at request time so webhook updates appear immediately.
export async function getArticleList() {
  await connection();
  return getPrisma().article.findMany({
    where: { slug: { not: null } },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      subtitle: true,
      metaDescription: true,
      category: true,
      imageUrl: true,
      readTime: true,
      publishedAt: true,
    },
  });
}

// Wrapped in cache() so the article layout and page share one query per request.
export const getArticleBySlug = cache(async (slug: string) => {
  await connection();
  return getPrisma().article.findUnique({ where: { slug } });
});

export async function getSitemapArticles() {
  await connection();
  return getPrisma().article.findMany({
    where: { slug: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { slug: true, updatedAt: true },
  });
}

export function formatArticleDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });
}

// GrandRanker may send JSON-LD as an object, an array, or a JSON string.
export function parseJsonLd(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}
