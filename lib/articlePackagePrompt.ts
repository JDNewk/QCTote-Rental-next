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
- Include facebookBlurb as an editable proposal for a Facebook Page post.
- Write it as one compact paragraph by default, generally 1-2 sentences.
- Put the complete useful point in the first sentence so it still works if Facebook truncates later text.
- Give someone a natural reason to open the article without summarizing every section.
- Complement the article headline rather than simply repeating or paraphrasing it.
- Do not write it like an SEO meta description.
- Do not add a manual line break after an opening hook or question.
- Keep it concise, practical, conversational, and accurate.
- Do not include a URL. The publishing system attaches the saved article's real URL.
- Do not use hashtags by default.
- Use zero to two emojis at most, and only when they are genuinely useful and appropriate to the article.
- Do not invent urgency, statistics, testimonials, discounts, savings, environmental claims, safety claims, or other unsupported claims.
- Mention QC Tote Rental naturally only when relevant.
- The blurb should make sense immediately above the shared article preview, which already supplies the article title, description, and featured image.
- The blurb is a draft for human review. Generating it does not authorize Facebook publishing.

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
- facebookBlurb is present, URL-free, accurate, written as compact natural Facebook copy, and ready for human editing.
- facebookBlurb's first sentence contains the useful point and does not depend on later text being visible.
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
