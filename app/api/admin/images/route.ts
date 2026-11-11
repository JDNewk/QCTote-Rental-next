import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";

const STORE_NAME = "qc-article-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP, or GIF image." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The selected image is empty." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "The image must be 8 MB or smaller." }, { status: 413 });
    }

    const key = `${randomUUID()}.${extension}`;
    const store = getStore({ name: STORE_NAME, consistency: "strong" });

    await store.set(key, file, {
      metadata: {
        contentType: file.type,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
      onlyIfNew: true,
    });

    const origin = new URL(request.url).origin;
    const url = `${origin}/api/article-images/${encodeURIComponent(key)}`;

    return NextResponse.json({ ok: true, key, url }, { status: 201 });
  } catch (error) {
    console.error("Featured image upload failed:", error);
    return NextResponse.json({ error: "The image could not be uploaded." }, { status: 500 });
  }
}
