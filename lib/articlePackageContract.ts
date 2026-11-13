export type EditorialIntent =
  | "Local / customer intent"
  | "Helpful / informational"
  | "Seasonal / local";

export type ArticlePackageVersion = 1 | 2 | 3;
export type ArticleImageWidth = 33 | 50 | 75 | 100;

export type ArticleImagePlacement = {
  afterHeading?: string;
  beforeHeading?: string;
};

export type ArticleImagePlan = {
  id: string;
  kind: "featured" | "body";
  recommendation: string;

  // Legacy packages can keep using a plain-language location.
  location?: string;

  // Version 3 packages can provide a machine-readable placement.
  placement?: ArticleImagePlacement;
  width?: ArticleImageWidth;
  altText?: string;
  required?: boolean;
  generationPrompt?: string;
  useQcToteVisualStandard?: boolean;
};

export type RelatedArticleReference = {
  linkText: string;
  targetTitle: string;
  targetSlug: string | null;
  status: "resolved" | "not-found";
};

export type ArticlePackage = {
  version?: ArticlePackageVersion;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  authorName?: string;
  imageUrl?: string;
  readTime?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml: string;
  includeTableOfContents?: boolean;
  images?: ArticleImagePlan[];

  // Added in version 3. Older packages can omit this.
  relatedArticleLinks?: RelatedArticleReference[];
};

export type ArticlePackageCalendarItem = {
  publishDate: string;
  title: string;
  slug: string;
  intent: EditorialIntent;
};

export type ExistingArticleReference = {
  title: string;
  slug: string;
  publishedAt: string | null;
};

export type ArticlePackageBusinessContext = {
  businessName: string;
  siteUrl: string;
  productDescription: string;
  serviceAreas: string[];
  fixedPages: {
    home: "/";
    movingBoxes: "/moving-boxes";
    pricing: "/pricing";
    serviceArea: "/service-area";
    reserve: "/reserve";
  };
};

export type ArticlePackageGeneratorInput = {
  calendarItem: ArticlePackageCalendarItem;
  existingArticles: ExistingArticleReference[];
  businessContext: ArticlePackageBusinessContext;
  editorialInstructions: string;
};

export type FixedSiteLinkAuditItem = {
  text: string;
  url: string;
  valid: boolean;
};

export type ArticlePackageLinkAudit = {
  fixedSiteLinks: FixedSiteLinkAuditItem[];
  relatedArticles: RelatedArticleReference[];
};

export type ArticlePackageValidation = {
  valid: boolean;
  warnings: string[];
};

export type ArticlePackageGeneratorResult = {
  package: ArticlePackage & { version: 3 };
  validation: ArticlePackageValidation;
  linkAudit: ArticlePackageLinkAudit;
};

export const QC_TOTE_VISUAL_STANDARD = `
When depicting QC Tote Rental totes, use a heavy-duty 27-gallon
stackable plastic storage tote modeled on the general proportions
and construction style of a Home Depot HDX 27-gallon tote.

Use sturdy rectangular proportions, reinforced molded construction,
molded handles, and a stackable lid. Use QC Tote Rental's black and
bright lime-green visual direction when appropriate.

Do not include Home Depot, HDX, manufacturer logos, branding, labels,
text, or numbers on the tote.
`.trim();

export const QC_TOTE_FIXED_PAGES = {
  home: "/",
  movingBoxes: "/moving-boxes",
  pricing: "/pricing",
  serviceArea: "/service-area",
  reserve: "/reserve",
} as const;

export function isApprovedFixedPage(value: string) {
  return Object.values(QC_TOTE_FIXED_PAGES).includes(
    value as (typeof QC_TOTE_FIXED_PAGES)[keyof typeof QC_TOTE_FIXED_PAGES],
  );
}

export function validateArticlePackage(packageValue: ArticlePackage): ArticlePackageValidation {
  const warnings: string[] = [];

  if (!packageValue.title.trim()) warnings.push("Article title is missing.");
  if (!packageValue.contentHtml.trim()) warnings.push("Article content is missing.");
  if (!packageValue.metaTitle?.trim()) warnings.push("SEO title is missing.");
  if (!packageValue.metaDescription?.trim()) warnings.push("Meta description is missing.");

  const imageIds = new Set<string>();
  for (const image of packageValue.images ?? []) {
    if (!image.id.trim()) warnings.push("An image recommendation is missing an id.");
    if (imageIds.has(image.id)) warnings.push(`Image id \"${image.id}\" is duplicated.`);
    imageIds.add(image.id);
  }

  for (const related of packageValue.relatedArticleLinks ?? []) {
    if (related.status === "resolved" && !related.targetSlug) {
      warnings.push(`Related article \"${related.targetTitle}\" is marked resolved without a slug.`);
    }
  }

  return { valid: warnings.length === 0, warnings };
}
