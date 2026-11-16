import type { Metadata } from "next";
import "../../../globals.css";
import SiteBody from "@/components/SiteBody";
import { serializeJsonLd, siteMetadata, siteUrl } from "@/config/siteMetadata";
import { getArticleBySlug, parseJsonLd } from "@/lib/articles";

// Article pages render fully on the server before responding, so a missing
// slug returns a real 404 status and the JSON-LD can be placed in <head>.
export const instant = false;

// Cache Components requires at least one value for the root `slug` param at
// build time. Articles arrive later via webhook, so a placeholder is used for
// build validation; real slugs render on request and unknown ones 404.
const PLACEHOLDER_SLUG = "__placeholder__";

export function generateStaticParams() {
  return [{ slug: PLACEHOLDER_SLUG }];
}

function normalizedArticleImageUrl(
  imageUrl: string | null | undefined,
  version?: string,
) {
  const trimmed = imageUrl?.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed, siteUrl);

    if (parsed.pathname.startsWith("/api/article-images/")) {
      const productionUrl = new URL(parsed.pathname, siteUrl);

      if (version) {
        productionUrl.searchParams.set("v", version);
      }

      return productionUrl.toString();
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

function normalizeJsonLdArticleImages(
  value: unknown,
  version?: string,
): unknown {
  if (typeof value === "string") {
    try {
      const parsed = new URL(value, siteUrl);

      if (parsed.pathname.startsWith("/api/article-images/")) {
        return normalizedArticleImageUrl(value, version) ?? value;
      }
    } catch {
      return value;
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonLdArticleImages(item, version));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === "image"
          ? normalizeJsonLdArticleImages(item, version)
          : normalizeJsonLdArticleImages(item, version),
      ]),
    );
  }

  return value;
}

export async function generateMetadata({
  params,
}: LayoutProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return siteMetadata;
  }

  const title =
    article.metaTitle?.trim() ||
    article.title?.trim() ||
    "QC Tote Rental";

  const description =
    article.metaDescription?.trim() ||
    article.subtitle?.trim() ||
    siteMetadata.description;

  const canonicalUrl = `${siteUrl}/blog/${article.slug ?? slug}`;
  const imageVersion = article.updatedAt
    ? new Date(article.updatedAt).getTime().toString()
    : undefined;
  const imageUrl = normalizedArticleImageUrl(
    article.imageUrl,
    imageVersion,
  );

  return {
    metadataBase: siteMetadata.metadataBase,
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonicalUrl,
      siteName: "QC Tote Rental",
      type: "article",
      ...(article.publishedAt
        ? { publishedTime: article.publishedAt.toISOString() }
        : {}),
      ...(article.updatedAt
        ? { modifiedTime: article.updatedAt.toISOString() }
        : {}),
      ...(article.authorName?.trim()
        ? { authors: [article.authorName.trim()] }
        : {}),
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                alt: article.title?.trim() || title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      ...(imageUrl
        ? {
            images: [imageUrl],
          }
        : {}),
    },
  };
}

// Root layout for article pages. It lives in its own route group so it can
// put each article's JSON-LD schema in the document <head>.
export default async function ArticleRootLayout({
  children,
  params,
}: LayoutProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const jsonLd = parseJsonLd(article?.jsonLdSchema);
  const imageVersion = article?.updatedAt
    ? new Date(article.updatedAt).getTime().toString()
    : undefined;
  const normalizedJsonLd = jsonLd
    ? normalizeJsonLdArticleImages(jsonLd, imageVersion)
    : null;
  const normalizedJsonLdHtml = normalizedJsonLd
    ? serializeJsonLd(normalizedJsonLd)
    : null;

  return (
    <html lang={article?.languageCode || "en"}>
      <head>
        {normalizedJsonLdHtml ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: normalizedJsonLdHtml,
            }}
          />
        ) : null}
      </head>
      <SiteBody>{children}</SiteBody>
    </html>
  );
}
