import type { EditorialIntent } from "@/lib/articlePackageContract";

export type PublishedArticleForPrompt = { title: string; slug: string };
export type PackagePromptInput = {
  calendarItem: { publishDate: string; title: string; slug: string; intent: EditorialIntent };
  publishedArticles: PublishedArticleForPrompt[];
};

const QC_TOTE_PACKAGE_SPECIFICATION = `
You are creating a production-ready Article Package for QC Tote Rental.

CONTENT AND CLAIMS
- Write for a person planning a move first, using practical American English.
- Answer the searcher's question directly. Avoid filler, keyword stuffing, exaggerated marketing, and generic AI introductions.
- Introduce QC Tote Rental only where relevant.
- Do not invent statistics, testimonials, prices, savings, environmental claims, safety claims, performance claims, policies, or business facts.
- Do not claim reusable totes are cheaper than cardboard boxes.

SEO AND LINKS
- Use the exact required calendar slug.
- Create a concise SEO title and natural meta description.
- Use a useful H2/H3 hierarchy and geography only where relevant.
- Fixed internal links may use only /, /moving-boxes, /pricing, /service-area, and /reserve.
- Blog links may use only exact slugs from CURRENT PUBLISHED ARTICLE INVENTORY.
- Never infer or manufacture a /blog/ slug.

FACEBOOK BLURB
- Include facebookBlurb as an editable proposal for a future Facebook Page post.
- Keep it practical, accurate, and concise.
- Summarize why the article is useful without unsupported claims or exaggerated marketing language.
- Do not include a URL. The publishing system will append the saved article's real URL later.
- The blurb is a draft for human review, not authorization to post.

ARTICLE HTML
- contentHtml must contain article-body HTML only, without the page H1.
- Use clean semantic HTML, not Markdown.
- Use site-relative URLs for QC Tote Rental links.

IMAGE PLAN
- Include a useful featured-image plan and body images only where useful.
- Every image needs a unique id, kind, recommendation, altText, required flag, and scene-specific generationPrompt.
- Body images normally include width 33, 50, 75, or 100 plus a human-readable location.
- Insert body markers exactly as <!--ARTICLE_IMAGE:image-id-->.
- Set useQcToteVisualStandard to true when an image depicts QC Tote Rental-style totes.

Return valid JSON only, using this structure:
{
  "version": 3,
  "title": "...",
  "slug": "...",
  "subtitle": "...",
  "category": "Moving Tips",
  "authorName": "QC Tote Rental Editorial Team",
  "readTime": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "facebookBlurb": "...",
  "contentHtml": "...",
  "includeTableOfContents": true,
  "images": [],
  "relatedArticleLinks": []
}

FINAL VALIDATION
- Version is exactly 3 and slug exactly matches the calendar slug.
- facebookBlurb is present, URL-free, accurate, and ready for human editing.
- contentHtml is valid HTML.
- No unsupported claims or invented URLs exist.
- All body markers match image IDs.
- JSON parses with no comments or trailing commas.
`.trim();

export function buildArticlePackageRequest({ calendarItem, publishedArticles }: PackagePromptInput) {
  const publishedInventory = publishedArticles.length
    ? publishedArticles.map((article) => `- ${article.title}\n  slug: ${article.slug}`).join("\n")
    : "- No published blog articles are currently available for blog-to-blog linking.";

  return `Create and attach a downloadable JSON file. Do not return the completed package only as chat text.\n\nRequired filename: ${calendarItem.slug}.json\n\nCreate a complete QC Tote Rental Article Package version 3.\n\nPLANNED ARTICLE\nTitle: ${calendarItem.title}\nRequired slug: ${calendarItem.slug}\nPlanned publication date: ${calendarItem.publishDate}\nEditorial intent: ${calendarItem.intent}\n\n${QC_TOTE_PACKAGE_SPECIFICATION}\n\nCURRENT PUBLISHED ARTICLE INVENTORY\n${publishedInventory}\n\nCreate and attach the completed package as ${calendarItem.slug}.json.`;
}
