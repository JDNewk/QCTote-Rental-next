import { siteUrl } from "@/config/siteMetadata";

export function normalizeArticleImageUrl(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed, siteUrl);
    if (!parsed.pathname.startsWith("/api/article-images/")) {
      return parsed.toString();
    }

    const normalized = new URL(parsed.pathname, siteUrl);
    normalized.search = parsed.search;
    return normalized.toString();
  } catch {
    return trimmed;
  }
}

export function normalizeArticleImageUrlsInHtml(
  html: string | null | undefined,
): string | null {
  const trimmed = html?.trim();
  if (!trimmed) return null;

  return trimmed.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi,
    (match, before: string, src: string, after: string) => {
      const normalized = normalizeArticleImageUrl(src);
      return normalized ? `${before}${normalized}${after}` : match;
    },
  );
}
