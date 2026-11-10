import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAdmin } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";

export const instant = false;

export default async function EditArticlePage({ params }: { params: Promise<{ externalId: string }> }) {
  await requireAdmin();
  const { externalId } = await params;
  const article = await getPrisma().article.findUnique({ where: { externalId } });
  if (!article) notFound();

  return <ArticleEditor initialArticle={{
    externalId: article.externalId,
    title: article.title ?? "",
    slug: article.slug ?? "",
    subtitle: article.subtitle ?? "",
    category: article.category ?? "Moving Tips",
    authorName: article.authorName ?? "QC Tote Rental Editorial Team",
    imageUrl: article.imageUrl ?? "",
    readTime: article.readTime ?? "",
    metaTitle: article.metaTitle ?? "",
    metaDescription: article.metaDescription ?? "",
    contentHtml: article.contentHtml ?? "",
    publishedAt: article.publishedAt?.toISOString() ?? "",
  }} />;
}
