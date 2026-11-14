import type { EditorialIntent } from "@/lib/articlePackageContract";

export type PublishedArticleForPrompt = {
  title: string;
  slug: string;
};

export type PackagePromptInput = {
  calendarItem: {
    publishDate: string;
    title: string;
    slug: string;
    intent: EditorialIntent;
  };
  publishedArticles: PublishedArticleForPrompt[];
};

const QC_TOTE_PACKAGE_SPECIFICATION = `
You are creating a production-ready article package for QC Tote Rental, a reusable plastic moving tote rental business serving the Quad Cities and surrounding communities.

CONTENT QUALITY
- Write for a person planning a move first. The article must be genuinely useful even if the reader never rents moving totes.
- Answer the searcher's likely question directly and naturally.
- Use clear, practical, conversational American English.
- Avoid repetitive phrasing, filler, keyword stuffing, exaggerated marketing language, and generic AI-sounding introductions.
- Introduce QC Tote Rental only where the service is genuinely relevant to the reader's problem.
- Do not invent statistics, customer testimonials, prices, savings claims, environmental claims, product-performance claims, service policies, or business facts.
- Describe the customer's need naturally with phrases such as moving boxes, plastic moving boxes, reusable moving boxes, moving box rental, and moving totes when those terms fit the sentence.
- Do not force all of those phrases into the article.

SEO
- Optimize naturally around the primary search intent represented by the planned article title.
- The reader experience comes first; SEO should shape coverage and terminology without making the writing sound optimized for a search engine.
- Create a concise SEO title that accurately describes the article.
- Create a natural meta description that explains the benefit of reading the article.
- Use a logical H2/H3 hierarchy based on useful subquestions or stages of the topic.
- Use Quad Cities and individual city names only where geographically relevant. Do not repeat locations unnaturally for SEO.
- Avoid substantial duplication of the published articles supplied below.
- Include an FAQ section only when the questions add useful information rather than repeating earlier sections word for word.

QC TOTE RENTAL CONTEXT
- Business name: QC Tote Rental.
- Product: reusable 27-gallon plastic moving totes / reusable plastic moving boxes.
- Service concept: totes are delivered before the move and collected after the rental.
- Useful benefits that may be mentioned when relevant: no cardboard-box assembly, no packing tape required to close the totes, consistent sizing, stackability, durability, reuse, delivery, pickup, and avoiding piles of cardboard after the move.
- Do not claim reusable totes are cheaper than cardboard boxes.

APPROVED FIXED INTERNAL ROUTES
Use these site routes only when they are a natural next step:
- /moving-boxes
- /pricing
- /service-area
- /reserve
- /

BLOG-TO-BLOG LINK RULES
- Never invent, infer, or manufacture a /blog/ slug from an article title.
- Blog links may point only to articles explicitly listed in the CURRENT PUBLISHED ARTICLE INVENTORY below.
- Use the exact supplied slug for any related article link.
- If no supplied published article is genuinely relevant, do not force a blog-to-blog link.
- The QC Tote Rental Admin will independently validate all internal links before accepting the package.

ARTICLE HTML
- contentHtml must contain clean article-body HTML only. Do not include the article H1/title inside contentHtml.
- Use p, h2, h3, ul, ol, li, strong, em, a, blockquote, and the image markers described below when appropriate.
- Do not return Markdown inside contentHtml.
- Use site-relative href values for QC Tote Rental internal links.
- Make the article substantial enough to answer the topic well, but do not pad it to achieve an arbitrary word count.

IMAGE PLAN
- Include a useful featured-image plan.
- Include body images only where they improve comprehension, visual pacing, or usefulness.
- Each image requires a unique id, kind, recommendation, altText, required flag, and a scene-specific generationPrompt.
- Body images should normally include a width of 33, 50, 75, or 100 and a human-readable location.
- Insert a body-image marker in contentHtml at the exact desired insertion point using this format: <!--ARTICLE_IMAGE:image-id-->
- The marker id must exactly match the corresponding image-plan id.
- If an image depicts QC Tote Rental-style totes, set useQcToteVisualStandard to true. Do not repeat the permanent tote-construction standard in generationPrompt; the Admin app appends that standard automatically when the image prompt is copied.
- generationPrompt should describe the specific scene, composition, setting, subject, and visual purpose of that image.
- Prefer realistic residential moving imagery unless the concept clearly calls for a different treatment.

PACKAGE FORMAT
Return valid JSON using this structure and no extra prose outside the JSON object:
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
  "contentHtml": "...",
  "includeTableOfContents": true,
  "images": [
    {
      "id": "featured-example",
      "kind": "featured",
      "recommendation": "...",
      "altText": "...",
      "required": true,
      "generationPrompt": "...",
      "useQcToteVisualStandard": true
    },
    {
      "id": "body-example",
      "kind": "body",
      "recommendation": "...",
      "location": "After [specific section heading or paragraph]",
      "width": 50,
      "altText": "...",
      "required": false,
      "generationPrompt": "...",
      "useQcToteVisualStandard": true
    }
  ],
  "relatedArticleLinks": [
    {
      "linkText": "...",
      "targetTitle": "...",
      "targetSlug": "exact-published-slug-or-null",
      "status": "resolved"
    }
  ]
}

RELATED ARTICLE LINK DATA
- relatedArticleLinks should document blog-to-blog links actually used in contentHtml.
- For a resolved related article, targetSlug must be copied exactly from CURRENT PUBLISHED ARTICLE INVENTORY.
- If no related published article is used, return an empty relatedArticleLinks array.

FINAL VALIDATION BEFORE RETURNING JSON
- Version is exactly 3.
- title matches the planned article topic.
- slug exactly matches the required calendar slug supplied below.
- contentHtml is valid article HTML rather than Markdown.
- SEO title and meta description are present and natural.
- Article is useful and readable without depending on sales copy.
- No unsupported QC Tote Rental claims were invented.
- No /blog/ URL was invented.
- All blog URLs use exact slugs supplied in CURRENT PUBLISHED ARTICLE INVENTORY.
- Every body-image marker has a matching image id.
- Every image has useful alt text and a scene-specific generation prompt.
- The JSON parses successfully with no comments or trailing commas.
`;

export function buildArticlePackageRequest({
  calendarItem,
  publishedArticles,
}: PackagePromptInput) {
  const publishedInventory = publishedArticles.length
    ? publishedArticles
        .map(
          (article) =>
            `- ${article.title}\n  slug: ${article.slug}`,
        )
        .join("\n")
    : "- No published blog articles are currently available for blog-to-blog linking.";

  return `Create and attach a downloadable JSON file. Do not return the completed article package only as chat text, a Markdown code block, or plain-text JSON. The downloadable .json file is the required deliverable.\n\nRequired filename: ${calendarItem.slug}.json\n\nCreate a complete QC Tote Rental Article Package version 3 for the planned article below. The file must contain valid JSON that can be imported directly into the QC Tote Rental Admin. Do not include commentary before or after the file deliverable.\n\nPLANNED ARTICLE\nTitle: ${calendarItem.title}\nRequired slug: ${calendarItem.slug}\nPlanned publication date: ${calendarItem.publishDate}\nEditorial intent: ${calendarItem.intent}\n\n${QC_TOTE_PACKAGE_SPECIFICATION}\n\nCURRENT PUBLISHED ARTICLE INVENTORY\nThese are the only blog articles currently approved as targets for blog-to-blog links. Use an exact slug from this list or omit the blog link.\n${publishedInventory}\n\nFINAL OUTPUT REQUIREMENT\nCreate and attach the completed package as a downloadable file named ${calendarItem.slug}.json. The JSON file is the deliverable. Do not substitute a Markdown code block, inline JSON, or plain-text JSON response for the downloadable file.`;
}
