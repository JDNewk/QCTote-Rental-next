import "server-only";

import { FacebookPostStatus } from "@/generated/prisma/client";
import {
  publishArticleToFacebook,
  type FacebookArticlePublishResult,
} from "@/lib/facebookArticlePublisher";
import { getPrisma } from "@/lib/prisma";

const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 10;

export type DueFacebookArticleResult = {
  externalId: string;
  result: FacebookArticlePublishResult;
};

export type DueFacebookPublishSummary = {
  checkedAt: string;
  eligibleCount: number;
  processedCount: number;
  postedCount: number;
  failedCount: number;
  skippedCount: number;
  results: DueFacebookArticleResult[];
};

function normalizedBatchSize(batchSize?: number): number {
  if (
    typeof batchSize !== "number" ||
    !Number.isFinite(batchSize)
  ) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(
    Math.max(Math.trunc(batchSize), 1),
    MAX_BATCH_SIZE,
  );
}

export async function publishDueFacebookArticles(
  batchSize?: number,
): Promise<DueFacebookPublishSummary> {
  const prisma = getPrisma();
  const checkedAt = new Date();
  const take = normalizedBatchSize(batchSize);

  const dueArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        not: null,
        lte: checkedAt,
      },
      facebookPostingEnabled: true,
      facebookPostStatus: FacebookPostStatus.PENDING,
      facebookPostId: null,
      slug: {
        not: null,
      },
      facebookBlurb: {
        not: null,
      },
    },
    select: {
      externalId: true,
    },
    orderBy: [
      {
        publishedAt: "asc",
      },
      {
        updatedAt: "asc",
      },
    ],
    take,
  });

  const results: DueFacebookArticleResult[] = [];

  /*
   * Process articles sequentially rather than all at once.
   *
   * This keeps database and Facebook API activity controlled and makes
   * the scheduled function less likely to exceed its runtime limit.
   */
  for (const article of dueArticles) {
    let result: FacebookArticlePublishResult;

    try {
      result = await publishArticleToFacebook(article.externalId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected Facebook publishing error occurred.";

      console.error(
        `Unexpected scheduled Facebook publishing error for article ${article.externalId}:`,
        error,
      );

      result = {
        outcome: "FAILED",
        message,
      };
    }

    results.push({
      externalId: article.externalId,
      result,
    });
  }

  const postedCount = results.filter(
    ({ result }) => result.outcome === "POSTED",
  ).length;

  const failedCount = results.filter(
    ({ result }) => result.outcome === "FAILED",
  ).length;

  const skippedCount =
    results.length - postedCount - failedCount;

  return {
    checkedAt: checkedAt.toISOString(),
    eligibleCount: dueArticles.length,
    processedCount: results.length,
    postedCount,
    failedCount,
    skippedCount,
    results,
  };
}