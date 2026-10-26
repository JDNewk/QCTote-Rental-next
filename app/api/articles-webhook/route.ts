import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

// Articles include full HTML, so allow request bodies up to 10 MB.
const MAX_BODY_BYTES = 10 * 1024 * 1024;

type Payload = {
  event_type?: string;
  data?: { id?: unknown; articles?: Record<string, unknown>[] };
};

function isAuthorized(request: Request) {
  const secret = process.env.GRANDRANKER_SECRET;
  if (!secret) {
    console.error("GRANDRANKER_SECRET is not configured.");
    return false;
  }
  const provided = request.headers.get("x-api-key") ?? "";
  // Compare digests so the check takes the same time regardless of input.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

function text(value: unknown) {
  return value == null ? null : String(value);
}

function integer(value: unknown) {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function date(value: unknown) {
  if (value == null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function json(value: unknown) {
  return value == null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

// Only the columns in the articles table are copied; any other payload fields are ignored.
function toArticleRow(item: Record<string, unknown>) {
  return {
    externalId: String(item.id),
    title: text(item.title),
    slug: text(item.slug),
    contentHtml: text(item.content_html),
    contentMarkdown: text(item.content_markdown),
    metaTitle: text(item.meta_title),
    metaDescription: text(item.meta_description),
    subtitle: text(item.subtitle),
    category: text(item.category),
    authorName: text(item.author_name),
    imageUrl: text(item.image_url),
    readTime: text(item.read_time),
    wordCount: integer(item.word_count),
    tags: json(item.tags),
    faqs: json(item.faqs),
    jsonLdSchema: json(item.json_ld_schema),
    languageCode: text(item.language_code),
    publishedAt: date(item.publish_date),
    updatedAt: date(item.updated_at) ?? new Date(),
  };
}

// Health checks
export function GET() {
  return NextResponse.json({ ok: true });
}

export function HEAD() {
  return new Response(null, { status: 200 });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let payload: Payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prisma = getPrisma();

  try {
    if (payload.event_type === "publish_articles") {
      const items = Array.isArray(payload.data?.articles) ? payload.data.articles : [];
      const rows = items.filter((item) => item && item.id != null).map(toArticleRow);

      await prisma.$transaction(
        rows.map(({ externalId, ...fields }) =>
          prisma.article.upsert({
            where: { externalId },
            create: { externalId, ...fields },
            update: fields,
          })
        )
      );

      return NextResponse.json({ ok: true, upserted: rows.length, skipped: items.length - rows.length });
    }

    if (payload.event_type === "unpublish_article") {
      const id = payload.data?.id;
      if (id == null) {
        return NextResponse.json({ error: "Missing data.id" }, { status: 400 });
      }
      const { count } = await prisma.article.deleteMany({ where: { externalId: String(id) } });
      return NextResponse.json({ ok: true, deleted: count });
    }

    return NextResponse.json({ ok: true, ignored: payload.event_type ?? null });
  } catch (error) {
    console.error("Articles webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
