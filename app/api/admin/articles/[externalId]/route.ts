import { NextResponse } from "next/server";
import { FacebookPostStatus } from "@/generated/prisma/client";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import { removeArticleFromFacebook } from "@/lib/facebookArticlePublisher";
import { getPrisma } from "@/lib/prisma";
import {
  articleJsonLd,
  validateArticleInput,
} from "@/lib/manualArticle";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ externalId: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 },
    );
  }

  try {
    const { externalId } = await params;
    const prisma = getPrisma();

    const existingArticle = await prisma.article.findUnique({
      where: {
        externalId,
      },
      select: {
        publishedAt: true,
        facebookPostStatus: true,
        facebookPostId: true,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "The article was not found." },
        { status: 404 },
      );
    }

    const fields = validateArticleInput(await request.json());
    const now = new Date();

    const wasPublic =
      existingArticle.publishedAt !== null &&
      existingArticle.publishedAt <= now;

    const willBePublic =
      fields.publishedAt !== null &&
      fields.publishedAt <= now;

    /*
     * Any approved article entering PENDING needs a clean posting record.
     * This covers republishing after REMOVED as well as older records that
     * reached PENDING while still retaining a deleted Facebook post ID.
     * A legitimate POSTED article keeps its existing Facebook metadata.
     */
    const shouldResetFacebookPostMetadata =
      fields.facebookPostStatus === FacebookPostStatus.PENDING &&
      existingArticle.facebookPostStatus !== FacebookPostStatus.POSTED;

    await prisma.article.update({
      where: {
        externalId,
      },
      data: {
        ...fields,
        jsonLdSchema: articleJsonLd(fields),
        ...(shouldResetFacebookPostMetadata
          ? {
              facebookPostId: null,
              facebookPostUrl: null,
              facebookPostedAt: null,
              facebookLastAttemptAt: null,
              facebookPostError: null,
            }
          : {}),
      },
    });

    /*
     * Facebook publishing is handled by the scheduled Netlify processor.
     * This gives a newly published article time to become publicly available
     * before Facebook requests its URL.
     *
     * Facebook removal is handled immediately when an article transitions
     * from public to unpublished or future-scheduled.
     */
    let facebookResult = null;

    if (
      wasPublic &&
      !willBePublic &&
      existingArticle.facebookPostId
    ) {
      try {
        facebookResult =
          await removeArticleFromFacebook(externalId);
      } catch (facebookError) {
        console.error(
          `Unexpected Facebook removal error for article ${externalId}:`,
          facebookError,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      externalId,
      facebook: facebookResult,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The article could not be updated.";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ externalId: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid origin" },
      { status: 403 },
    );
  }

  const { externalId } = await params;

  await getPrisma().article.delete({
    where: {
      externalId,
    },
  });

  return NextResponse.json({ ok: true });
}
