import { cache } from "react";
import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function getArticleList() {
  await connection();
  return getPrisma().article.findMany({
    where: { slug: { not: null }, publishedAt: { lte: new Date() } },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    select: { slug: true, title: true, subtitle: true, metaDescription: true, category: true, imageUrl: true, readTime: true, publishedAt: true },
  });
}

export const getArticleBySlug = cache(async (slug: string) => {
  await connection();
  return getPrisma().article.findFirst({
    where: { slug, publishedAt: { lte: new Date() } },
  });
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
