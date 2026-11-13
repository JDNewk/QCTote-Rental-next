import { Prisma } from "@/generated/prisma/client";
import type { ArticlePackage } from "@/lib/articlePackageContract";
import { getPrisma } from "@/lib/prisma";

export function validatePreparedArticlePackage(value: unknown): ArticlePackage {
  if (!value || typeof value !== "object") {
    throw new Error("The uploaded file is not a valid article package.");
  }

  const article = value as Partial<ArticlePackage>;

  if (article.version != null && ![1, 2, 3].includes(article.version)) {
    throw new Error("This article package version is not supported.");
  }
  if (!article.title?.trim()) {
    throw new Error("The article package is missing a title.");
  }
  if (!article.contentHtml?.trim()) {
    throw new Error("The article package is missing article content.");
  }

  const imageIds = new Set<string>();
  for (const image of article.images ?? []) {
    if (!image.id?.trim()) {
      throw new Error("Every image recommendation must have an id.");
    }
    if (imageIds.has(image.id)) {
      throw new Error(`The image id "${image.id}" is duplicated.`);
    }
    if (image.kind !== "featured" && image.kind !== "body") {
      throw new Error(`The image recommendation "${image.id}" has an unsupported kind.`);
    }
    imageIds.add(image.id);
  }

  return article as ArticlePackage;
}

export async function getStoredPreparedArticlePackage(planSlug: string) {
  const record = await getPrisma().preparedArticlePackage.findUnique({
    where: { planSlug },
    select: { packageJson: true },
  });

  return record ? validatePreparedArticlePackage(record.packageJson) : null;
}

export async function saveStoredPreparedArticlePackage(
  planSlug: string,
  articlePackage: ArticlePackage,
) {
  const validated = validatePreparedArticlePackage(articlePackage);
  const packageJson = validated as unknown as Prisma.InputJsonValue;

  await getPrisma().preparedArticlePackage.upsert({
    where: { planSlug },
    create: {
      planSlug,
      title: validated.title,
      packageJson,
    },
    update: {
      title: validated.title,
      packageJson,
    },
  });

  return validated;
}

export async function deleteStoredPreparedArticlePackage(planSlug: string) {
  await getPrisma().preparedArticlePackage.deleteMany({
    where: { planSlug },
  });
}
