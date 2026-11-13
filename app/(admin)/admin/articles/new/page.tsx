import Link from "next/link";
import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticlePackageImporter from "@/components/admin/ArticlePackageImporter";
import { editorialCalendar } from "@/config/editorialCalendar";
import { requireAdmin } from "@/lib/adminAuth";
import { getPreparedArticlePackage } from "@/content/article-packages/preparedArticlePackages";

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

  const packageId = calendarItem?.packageId ?? plan;
  const preparedPackage = getPreparedArticlePackage(packageId);

  const fallbackArticle = calendarItem && !preparedPackage
    ? {
        title: calendarItem.title,
        slug: calendarItem.slug,
        subtitle: "",
        category: calendarItem.intent === "Seasonal / local" ? "Moving Tips" : "Moving Tips",
        authorName: "QC Tote Rental Editorial Team",
        imageUrl: "",
        readTime: "",
        metaTitle: calendarItem.title,
        metaDescription: "",
        contentHtml: "",
        publishedAt: "",
      }
    : undefined;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-bold text-slate-700 hover:text-lime-600">
          Back to all articles
        </Link>

        <div className="mt-6">
          {preparedPackage ? (
            <ArticlePackageImporter
              initialPackage={preparedPackage}
              packageName={`${packageId}.json`}
            />
          ) : (
            <>
              {calendarItem ? (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  A full prepared package is not available for this calendar topic yet. The planned title and slug are prefilled below.
                </div>
              ) : null}
              <ArticlePackageImporter />
              <ArticleEditor initialArticle={fallbackArticle} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
