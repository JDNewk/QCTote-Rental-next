import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";
import { articleJsonLd, validateArticleInput } from "@/lib/manualArticle";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const fields = validateArticleInput(await request.json());
    const externalId = `manual-${randomUUID()}`;
    await getPrisma().article.create({
      data: { externalId, ...fields, jsonLdSchema: articleJsonLd(fields) },
    });
    return NextResponse.json({ ok: true, externalId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The article could not be created.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
