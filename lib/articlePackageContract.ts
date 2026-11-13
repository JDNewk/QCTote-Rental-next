export type EditorialIntent =
  | "Local / customer intent"
  | "Helpful / informational"
  | "Seasonal / local";

export type ArticlePackageGeneratorInput = {
  calendarItem: {
    publishDate: string;
    title: string;
    slug: string;
    intent: EditorialIntent;
  };
  existingArticles: ExistingArticleReference[];
  businessContext: ArticleBusinessContext;
  editorialInstructions: string;
};

export type ExistingArticleReference = {
  title: string;
  slug: string;
  publishedAt: string | null;
};

export type ArticleBusinessContext = {
  businessName: string;
  siteUrl: string;
  productDescription: string;
  serviceAreas: string[];
  fixedPages: {
    movingBoxes: "/moving-boxes";
    pricing: "/pricing";
    serviceArea: "/service-area";
    reserve: "/reserve";
  };
};

export type ArticleImageLocation = {
  afterHeading?: string;
  beforeHeading?: string;
};

export type ArticleImagePlan = {
  id: string;
  kind: "featured" | "body";
  recommendation: string;

  // Version 1/2 packages used a human-readable location string.
  // Version 3 may use a structured location for generated packages.
  location?: string | ArticleImageLocation;

  width?: 33 | 50 | 75 | 100;
  altText?: string;
  required?: boolean;
  generationPrompt?: string;

  // Legacy/version 2 name retained for compatibility.
  useQcToteReference?: boolean;

  // Version 3 generator-facing name.
  useQcToteVisualStandard?: boolean;
};

export type RelatedArticleLink = {
  linkText: string;
  targetTitle: string;
  targetSlug: string | null;
  status: "resolved" | "not-found";
};

export type ArticlePackage = {
  version?: 1 | 2 | 3;
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
  relatedArticleLinks?: RelatedArticleLink[];
};

export type GeneratedArticlePackage = ArticlePackage & {
  version: 3;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  authorName: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  includeTableOfContents: boolean;
  images: ArticleImagePlan[];
  relatedArticleLinks: RelatedArticleLink[];
};

export type FixedSiteLinkAuditItem = {
  text: string;
  url: string;
  valid: boolean;
};

export type ArticlePackageValidation = {
  valid: boolean;
  warnings: string[];
};

export type ArticlePackageLinkAudit = {
  fixedSiteLinks: FixedSiteLinkAuditItem[];
  relatedArticles: RelatedArticleLink[];
};

export type ArticlePackageGeneratorResult = {
  package: GeneratedArticlePackage;
  validation: ArticlePackageValidation;
  linkAudit: ArticlePackageLinkAudit;
};

export const APPROVED_FIXED_SITE_ROUTES = [
  "/",
  "/moving-boxes",
  "/pricing",
  "/service-area",
  "/reserve",
] as const;

export const QC_TOTE_VISUAL_STANDARD = `
When depicting QC Tote Rental totes, use a heavy-duty 27-gallon stackable plastic storage tote modeled on the general proportions and construction style of a Home Depot HDX 27-gallon tote.

Use sturdy rectangular proportions, reinforced molded construction, molded handles, and a stackable lid. Use QC Tote Rental's black and bright lime-green visual direction when appropriate.

Do not include Home Depot, HDX, manufacturer logos, branding, labels, text, or numbers on the tote.
`.trim();
