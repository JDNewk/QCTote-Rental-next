import "server-only";

import { FacebookPostStatus } from "@/generated/prisma/client";
import { siteUrl } from "@/config/siteMetadata";
import { publishFacebookPost } from "@/lib/facebook";
import { getPrisma } from "@/lib/prisma";

export type FacebookArticlePublishResult =
  | {
      outcome: "POSTED";
      postId: string;
      postUrl: string;
    }
  | {
      outcome:
        | "NOT_FOUND"
        | "NOT_APPROVED"
        | "NOT_PUBLIC"
        | "ALREADY_POSTED"
        | "NOT_PENDING"
        | "MISSING_CONTENT"
        | "ALREADY_CLAIMED"
        | "FAILED";
      message: string;
    };

const MAX_ERROR_LENGTH = 2000;

function errorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : "Facebook posting failed for an unknown reason.";

  return message.trim().slice(0, MAX_ERROR_LENGTH);
}

function publicArticleUrl(slug: string): string {
  return new URL(
    `/blog/${encodeURIComponent(slug)}`,
    siteUrl,
  ).toString();
}

export async function publishArticleToFacebook(
  externalId: string,
): Promise<FacebookArticlePublishResult> {
  const normalizedExternalId = externalId.trim();

  if (!normalizedExternalId) {
    return {
      outcome: "NOT_FOUND",
      message: "An article ID is required.",
    };
  }

  const prisma = getPrisma();

  const article = await prisma.article.findUnique({
    where: {
      externalId: normalizedExternalId,
    },
    select: {
      externalId: true,
      slug: true,
      publishedAt: true,
      facebookBlurb: true,
      facebookPostingEnabled: true,
      facebookPostStatus: true,
      facebookPostId: true,
      facebookPostUrl: true,
      facebookLastAttemptAt: true,
    },
  });

  if (!article) {
    return {
      outcome: "NOT_FOUND",
      message: "The article was not found.",
    };
  }

  if (article.facebookPostStatus === FacebookPostStatus.POSTED) {
    return {
      outcome: "ALREADY_POSTED",
      message: "This article has already been posted to Facebook.",
    };
  }

  if (!article.facebookPostingEnabled) {
    return {
      outcome: "NOT_APPROVED",
      message: "Facebook posting has not been approved for this article.",
    };
  }

  const now = new Date();

  if (!article.publishedAt || article.publishedAt > now) {
    return {
      outcome: "NOT_PUBLIC",
      message: "The article is not publicly available yet.",
    };
  }

  const slug = article.slug?.trim() ?? "";
  const blurb = article.facebookBlurb?.trim() ?? "";

  if (!slug || !blurb) {
    return {
      outcome: "MISSING_CONTENT",
      message:
        "The article needs both a slug and an approved Facebook blurb before posting.",
    };
  }

  if (article.facebookPostStatus !== FacebookPostStatus.PENDING) {
    return {
      outcome: "NOT_PENDING",
      message: `The Facebook post status is ${article.facebookPostStatus}, not PENDING.`,
    };
  }

  /*
   * Claim this exact pending attempt with a compare-and-set update.
   *
   * Including the previously read facebookLastAttemptAt value in the WHERE
   * clause prevents two requests that read the same article state from both
   * proceeding to Facebook. Only the first request can change the timestamp.
   *
   * A later retry can still work because it will read and compare against the
   * newer timestamp rather than requiring the field to remain null.
   */
  const claimTime = new Date();

  const claim = await prisma.article.updateMany({
    where: {
      externalId: article.externalId,
      facebookPostStatus: FacebookPostStatus.PENDING,
      facebookPostId: null,
      facebookLastAttemptAt: article.facebookLastAttemptAt,
    },
    data: {
      facebookLastAttemptAt: claimTime,
      facebookAttemptCount: {
        increment: 1,
      },
      facebookPostError: null,
    },
  });

  if (claim.count !== 1) {
    return {
      outcome: "ALREADY_CLAIMED",
      message:
        "Another Facebook posting attempt has already claimed this article.",
    };
  }

  try {
    const result = await publishFacebookPost({
      message: blurb,
      link: publicArticleUrl(slug),
    });

    const postedAt = new Date();

    await prisma.article.update({
      where: {
        externalId: article.externalId,
      },
      data: {
        facebookPostStatus: FacebookPostStatus.POSTED,
        facebookPostId: result.postId,
        facebookPostUrl: result.postUrl,
        facebookPostedAt: postedAt,
        facebookPostError: null,
      },
    });

    return {
      outcome: "POSTED",
      postId: result.postId,
      postUrl: result.postUrl,
    };
  } catch (error) {
    const message = errorMessage(error);

    try {
      await prisma.article.update({
        where: {
          externalId: article.externalId,
        },
        data: {
          facebookPostStatus: FacebookPostStatus.FAILED,
          facebookPostError: message,
        },
      });
    } catch (databaseError) {
      console.error(
        "Facebook posting failed, and the failure status could not be saved:",
        databaseError,
      );
    }

    return {
      outcome: "FAILED",
      message,
    };
  }
}