import { editorialCalendar } from "@/config/editorialCalendar";
import { getPrisma } from "@/lib/prisma";
import type {
  ArticleBusinessContext,
  ArticlePackageGeneratorInput,
  ExistingArticleReference,
} from "@/lib/articlePackageContract";

const businessContext: ArticleBusinessContext = {
  businessName: "QC Tote Rental",
  siteUrl: "https://qctoterentals.com",
  productDescription:
    "Reusable 27-gallon plastic moving tote rentals for the Quad Cities and surrounding communities, with delivery before the move and pickup after the rental.",
  serviceAreas: [
    "Davenport, IA",
    "Bettendorf, IA",
    "Rock Island, IL",
    "Moline, IL",
    "East Moline, IL",
    "Silvis, IL",
    "Milan, IL",
    "Geneseo, IL",
    "Coal Valley, IL",
    "Colona, IL",
    "Port Byron, IL",
    "LeClaire, IA",
    "Muscatine, IA",
    "Clinton, IA",
    "Eldridge, IA",
    "DeWitt, IA",
    "Orion, IL",
  ],
  fixedPages: {
    movingBoxes: "/moving-boxes",
    pricing: "/pricing",
    serviceArea: "/service-area",
    reserve: "/reserve",
  },
};

const editorialInstructions = `
QC Tote Rental provides reusable plastic moving box and moving tote rentals in the Quad Cities and surrounding communities.

Prioritize content that reaches people searching for moving boxes, moving supplies, packing help, and moving advice, including readers who may not yet know that reusable plastic moving boxes can be rented.

Naturally use terminology such as "moving boxes," "plastic moving boxes," "reusable moving boxes," "moving box rental," and "moving totes" when relevant. Do not keyword-stuff or repeatedly use the same phrase unnaturally.

Position reusable moving totes as a convenient alternative to cardboard moving boxes. Focus on benefits such as delivery, pickup, no box assembly, no tape required to close the totes, consistent sizing, stackability, durability, reuse, and avoiding piles of cardboard after a move.

Do not claim that renting reusable totes is cheaper than buying cardboard boxes, and do not create price or cost comparisons suggesting that QC Tote Rental saves money compared with cardboard.

Write useful articles for people planning a move rather than making every article a sales pitch. Answer the reader's question first and introduce QC Tote Rental naturally when the service is relevant.

Incorporate Quad Cities geographic relevance naturally when appropriate. Do not force city names into unrelated sections or create repetitive lists of locations solely for SEO.

Use internal links to help readers take the next logical step. Fixed site links may use only the approved routes supplied in businessContext.fixedPages. Blog-to-blog links may use only an existing article supplied in existingArticles. Never invent or infer a blog slug from a title.

Use the term "moving boxes" to describe the customer's need and "reusable plastic moving boxes" or "moving totes" to accurately describe QC Tote Rental's product.

Avoid unsupported environmental, safety, financial, or product-performance claims. Do not invent statistics, customer testimonials, savings amounts, or facts about QC Tote Rental that are not provided.

Keep the writing practical, local, helpful, and straightforward. Avoid exaggerated marketing language.
`.trim();

type ArticleInventoryRow = {
  title: string | null;
  slug: string | null;
  publishedAt: Date | null;
};

export async function buildArticlePackageGeneratorInput(
  planSlug: string,
): Promise<ArticlePackageGeneratorInput> {
  const calendarItem = editorialCalendar.find((item) => item.slug === planSlug);
  if (!calendarItem) {
    throw new Error(`Publishing-calendar item not found for slug: ${planSlug}`);
  }

  const rows: ArticleInventoryRow[] = await getPrisma().article.findMany({
    where: { slug: { not: null } },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
    select: {
      title: true,
      slug: true,
      publishedAt: true,
    },
  });

  const existingArticles: ExistingArticleReference[] = rows
    .filter(
      (article): article is ArticleInventoryRow & { title: string; slug: string } =>
        Boolean(article.title?.trim() && article.slug?.trim()),
    )
    .map((article) => ({
      title: article.title,
      slug: article.slug,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    }));

  return {
    calendarItem: {
      publishDate: calendarItem.publishDate,
      title: calendarItem.title,
      slug: calendarItem.slug,
      intent: calendarItem.intent,
    },
    existingArticles,
    businessContext,
    editorialInstructions,
  };
}
