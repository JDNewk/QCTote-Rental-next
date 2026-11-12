import ArticleEditor from "@/components/admin/ArticleEditor";
import ArticlePackageImporter from "@/components/admin/ArticlePackageImporter";
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
  const preparedPackage = getPreparedArticlePackage(plan);

  return (
    <>
      <ArticlePackageImporter initialPackage={preparedPackage} packageName={plan ? `${plan}.json` : undefined} />
      <ArticleEditor />
    </>
  );
}
