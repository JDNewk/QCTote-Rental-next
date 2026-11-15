import Link from "next/link";
import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticlePackageImporter from "@/components/admin/ArticlePackageImporter";
import { editorialCalendar } from "@/config/editorialCalendar";
import { getPreparedArticlePackage } from "@/content/article-packages/preparedArticlePackages";
import { requireAdmin } from "@/lib/adminAuth";
import { getStoredPreparedArticlePackage } from "@/lib/preparedArticlePackageStore";

export const instant = false;

type NewArticlePageProps = {
  searchParams: Promise<{ plan?: string | string[] }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  await requireAdmin();

  const params = await searchParams;
  const plan = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const calendarItem = plan
    ? editorialCalendar.find((item) => item.packageId === plan || item.slug === plan)
    : undefined;

  const storedPackage = calendarItem
    ? await getStoredPreparedArticlePackage(calendarItem.slug)
    : null;

  const sourcePackageId = calendarItem?.packageId ?? plan;
  const sourcePackage = storedPackage ? null : getPreparedArticlePackage(sourcePackageId);
  const preparedPackage = storedPackage ?? sourcePackage;
  const packageName = storedPackage
    ? `${calendarItem?.slug ?? plan}-stored.json`
    : sourcePackageId
      ? `${sourcePackageId}.json`
      : undefined;

  const fallbackArticle = calendarItem && !preparedPackage
    ? {
        title: calendarItem.title,
        slug: calendarItem.slug,
        subtitle: "",
        category: "Moving Tips",
        authorName: "QC Tote Rental Editorial Team",
        imageUrl: "",
        readTime: "",
        metaTitle: calendarItem.title,
        metaDescription: "",
        contentHtml: "",
        publishedAt: "",
        facebookBlurb: "",
        facebookPostingEnabled: false,
        facebookPostStatus: "NOT_REQUESTED" as const,
        facebookPostUrl: "",
        facebookPostedAt: "",
        facebookPostError: "",
      }
    : undefined;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-bold text-slate-700 hover:text-lime-600">
          Back to all articles
        </Link>

        {preparedPackage ? (
          <ArticlePackageImporter
            initialPackage={preparedPackage}
            packageName={packageName}
          />
        ) : null}

        <ArticleEditor initialArticle={fallbackArticle} />
      </div>
    </main>
  );
}
