import "../../../globals.css";
import SiteBody from "@/components/SiteBody";
import { serializeJsonLd, siteMetadata } from "@/config/siteMetadata";
import { getArticleBySlug, parseJsonLd } from "@/lib/articles";

export const metadata = siteMetadata;

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

// Root layout for article pages. It lives in its own route group so it can
// put each article's JSON-LD schema in the document <head>.
export default async function ArticleRootLayout({ children, params }: LayoutProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const jsonLd = parseJsonLd(article?.jsonLdSchema);

  return (
    <html lang={article?.languageCode || "en"}>
      <head>
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
        )}
      </head>
      <SiteBody>{children}</SiteBody>
    </html>
  );
}
