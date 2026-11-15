import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import { publishArticleToFacebook } from "@/lib/facebookArticlePublisher";
import { getPrisma } from "@/lib/prisma";
import { articleJsonLd, validateArticleInput } from "@/lib/manualArticle";

export async function PUT(request: Request, { params }: { params: Promise<{ externalId: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  try {
    const { externalId } = await params;
    const fields = validateArticleInput(await request.json());

    await getPrisma().article.update({
      where: { externalId },
      data: { ...fields, jsonLdSchema: articleJsonLd(fields) },
    });

    let facebookResult = null;

    try {
      facebookResult = await publishArticleToFacebook(externalId);
    } catch (facebookError) {
      console.error(
        `Unexpected Facebook publishing error for article ${externalId}:`,
        facebookError,
      );
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

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ externalId: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { externalId } = await params;
  await getPrisma().article.delete({ where: { externalId } });
  return NextResponse.json({ ok: true });
}
