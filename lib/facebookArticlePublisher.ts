import { FacebookPostStatus } from "@/generated/prisma/client";
import { siteUrl } from "@/config/siteMetadata";
import {
  deleteFacebookPost,
  publishFacebookPost,
} from "@/lib/facebook";
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

export type FacebookArticleRemoveResult =
  | {
      outcome: "REMOVED";
      postId: string;
    }
  | {
      outcome:
        | "NOT_FOUND"
        | "STILL_PUBLIC"
        | "NOT_POSTED"
        | "MISSING_POST_ID"
        | "FAILED";
      message: string;
    };

const MAX_ERROR_LENGTH = 2000;

function errorMessage(
  error: unknown,
  fallback = "Facebook operation failed for an unknown reason.",
): string {
  const message =
    error instanceof Error
      ? error.message
      : fallback;

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

  if (
    article.facebookPostStatus === FacebookPostStatus.POSTED
  ) {
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

  if (
    article.facebookPostStatus !== FacebookPostStatus.PENDING
  ) {
    return {
      outcome: "NOT_PENDING",
      message:
        `The Facebook post status is ${article.facebookPostStatus}, not PENDING.`,
    };
  }

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
    const message = errorMessage(
      error,
      "Facebook posting failed for an unknown reason.",
    );

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

export async function removeArticleFromFacebook(
  externalId: string,
): Promise<FacebookArticleRemoveResult> {
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
      publishedAt: true,
      facebookPostStatus: true,
      facebookPostId: true,
    },
  });

  if (!article) {
    return {
      outcome: "NOT_FOUND",
      message: "The article was not found.",
    };
  }

  const now = new Date();

  if (
    article.publishedAt &&
    article.publishedAt <= now
  ) {
    return {
      outcome: "STILL_PUBLIC",
      message:
        "The article is still public, so its Facebook post will not be removed.",
    };
  }

  if (
    article.facebookPostStatus !== FacebookPostStatus.POSTED
  ) {
    return {
      outcome: "NOT_POSTED",
      message:
        `The Facebook post status is ${article.facebookPostStatus}, not POSTED.`,
    };
  }

  const postId = article.facebookPostId?.trim() ?? "";

  if (!postId) {
    return {
      outcome: "MISSING_POST_ID",
      message:
        "The article is marked POSTED but does not have a stored Facebook post ID.",
    };
  }

  try {
    await deleteFacebookPost(postId);

    await prisma.article.update({
      where: {
        externalId: article.externalId,
      },
      data: {
        facebookPostStatus: FacebookPostStatus.REMOVED,
        facebookPostError: null,
      },
    });

    return {
      outcome: "REMOVED",
      postId,
    };
  } catch (error) {
    const message = errorMessage(
      error,
      "Facebook post removal failed for an unknown reason.",
    );

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
        "Facebook removal failed, and the failure status could not be saved:",
        databaseError,
      );
    }

    return {
      outcome: "FAILED",
      message,
    };
  }
}
