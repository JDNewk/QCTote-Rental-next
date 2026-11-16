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

function socialImageUrl(imageUrl: string | null | undefined): string | undefined {
  const value = imageUrl?.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value, siteUrl);

    // Article images are public through the production site's image endpoint.
    // Older packages may have stored a Netlify deploy-preview hostname when an
    // image was uploaded from a preview deployment. Social crawlers should
    // always receive the stable production-domain equivalent.
    if (url.pathname.startsWith("/api/article-images/")) {
      return new URL(`${url.pathname}${url.search}`, siteUrl).toString();
    }

    return url.toString();
  } catch {
    return undefined;
  }
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
  const imageUrl = socialImageUrl(article.imageUrl);

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

  return (
    <html lang={article?.languageCode || "en"}>
      <head>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
          />
        )}
      </head>
      <SiteBody>{children}</SiteBody>
    </html>
  );
}
