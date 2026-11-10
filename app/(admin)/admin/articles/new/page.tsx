import ArticleEditor from "@/components/admin/ArticleEditor";
import { requireAdmin } from "@/lib/adminAuth";

export const instant = false;

export default async function NewArticlePage() {
  await requireAdmin();
  return <ArticleEditor />;
}
