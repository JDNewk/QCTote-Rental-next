import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

type AdminArticle = Awaited<
  ReturnType<ReturnType<typeof getPrisma>["article"]["findMany"]>
>[number];

export const instant = false;

export default async function AdminPage() {
  await requireAdmin();

  const prisma = getPrisma();
  const articles: AdminArticle[] = await prisma.article.findMany({
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-lime-600">QC Tote Rental</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">Article Editor</h1>
            <p className="mt-2 text-slate-600">Create, edit, preview, schedule, and publish blog articles.</p>
          </div>

          <div className="flex gap-3">
            <Link href="/blog" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:border-lime-500">
              View Blog
            </Link>
            <Link href="/admin/articles/new" className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white hover:bg-lime-500 hover:text-slate-950">
              New Article
            </Link>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {articles.length === 0 ? (
            <div className="p-10 text-center text-slate-600">No articles yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {articles.map((article: AdminArticle) => {
                const now = new Date();
                const isPublished = Boolean(article.publishedAt && article.publishedAt <= now);
                const isScheduled = Boolean(article.publishedAt && article.publishedAt > now);
                const status = isPublished ? "Published" : isScheduled ? "Scheduled" : "Draft";

                return (
                  <div key={article.externalId} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-xl font-black text-slate-950">{article.title || "Untitled article"}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                            isPublished
                              ? "bg-lime-100 text-lime-800"
                              : isScheduled
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">/{article.slug || "no-slug"}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {article.slug && isPublished ? (
                        <Link href={`/blog/${article.slug}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-lime-500">
                          View
                        </Link>
                      ) : null}
                      <Link href={`/admin/articles/${encodeURIComponent(article.externalId)}`} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-lime-500 hover:text-slate-950">
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
