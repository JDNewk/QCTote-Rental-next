import { getStore } from "@netlify/blobs";

const STORE_NAME = "qc-article-images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const store = getStore(STORE_NAME);
  const result = await store.getWithMetadata(key, { type: "blob" });

  if (!result) {
    return new Response("Image not found", { status: 404 });
  }

  const metadata = (result.metadata ?? {}) as Record<string, unknown>;
  const contentType =
    typeof metadata.contentType === "string"
      ? metadata.contentType
      : "application/octet-stream";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  if (result.etag) {
    headers.set("ETag", result.etag);
  }

  return new Response(result.data, { headers });
}
