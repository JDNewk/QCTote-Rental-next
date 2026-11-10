import { Prisma } from "@/generated/prisma/client";
import { siteUrl } from "@/config/siteMetadata";

type Input = Record<string, unknown>;

function optional(value: unknown) {
  const result = String(value ?? "").trim();
  return result || null;
}

export function validateArticleInput(input: Input) {
  const title = optional(input.title);
  const slug = optional(input.slug)?.toLowerCase();
  const contentHtml = optional(input.contentHtml);
  if (!title) throw new Error("Title is required.");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Use a lowercase slug with words separated by hyphens.");
  if (!contentHtml) throw new Error("Article content is required.");
  const publishedAt = input.publishedAt ? new Date(String(input.publishedAt)) : null;
  if (publishedAt && Number.isNaN(publishedAt.getTime())) throw new Error("The publication date is invalid.");

  return {
    title,
    slug,
    contentHtml,
    contentMarkdown: null,
    subtitle: optional(input.subtitle),
    category: optional(input.category),
    authorName: optional(input.authorName) || "QC Tote Rental Editorial Team",
    imageUrl: optional(input.imageUrl),
    readTime: optional(input.readTime),
    metaTitle: optional(input.metaTitle) || title,
    metaDescription: optional(input.metaDescription) || optional(input.subtitle),
    publishedAt,
    updatedAt: new Date(),
  };
}

export function articleJsonLd(article: ReturnType<typeof validateArticleInput>): Prisma.InputJsonValue {
  const url = `${siteUrl}/blog/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription ?? undefined,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: article.imageUrl ? [article.imageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Organization", name: article.authorName, url: siteUrl },
    publisher: { "@type": "Organization", name: "QC Tote Rental", url: siteUrl },
  } as Prisma.InputJsonValue;
}
