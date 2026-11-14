import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";
import { articleJsonLd, validateArticleInput } from "@/lib/manualArticle";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const fields = validateArticleInput(await request.json());
    const prisma = getPrisma();

    if (fields.slug) {
      const existing = await prisma.article.findUnique({
        where: { slug: fields.slug },
        select: { externalId: true },
      });

      if (existing) {
        return NextResponse.json({
          ok: true,
          existing: true,
          externalId: existing.externalId,
        });
      }
    }

    const externalId = `manual-${randomUUID()}`;
    await prisma.article.create({
      data: { externalId, ...fields, jsonLdSchema: articleJsonLd(fields) },
    });

    return NextResponse.json(
      { ok: true, existing: false, externalId },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The article could not be created.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
