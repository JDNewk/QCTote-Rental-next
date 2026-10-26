import Link from "next/link";
import { formatArticleDate, getArticleList } from "@/lib/articles";

export const metadata = {
  title: "Moving Tips & Tote Rental Blog",
  description: "Moving tips, packing guides and local news from QC Tote Rental, serving the Quad Cities and surrounding areas.",
  alternates: { canonical: "/blog" },
};

// Render the full list on the server before responding so crawlers get it in the initial HTML.
export const instant = false;

export default async function BlogPage() {
  const articles = await getArticleList();

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <p className="font-bold uppercase tracking-widest text-lime-400">QC Tote Rental Blog</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Moving Tips & Local Updates</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">Packing guides, moving advice and news for movers across the Quad Cities and surrounding areas.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {articles.length === 0 ? (
          <p className="text-center text-lg text-slate-600">New articles are coming soon. Check back shortly.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-lime-400">
                {article.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.imageUrl} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-sm font-bold uppercase tracking-widest text-lime-600">
                    {[article.category, article.publishedAt && formatArticleDate(article.publishedAt)].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="mt-3 text-2xl font-black text-slate-950">
                    <Link href={`/blog/${article.slug}`} className="hover:text-lime-600">{article.title}</Link>
                  </h2>
                  <p className="mt-3 flex-1 leading-7 text-slate-600">{article.subtitle || article.metaDescription}</p>
                  <Link href={`/blog/${article.slug}`} className="mt-5 font-bold text-slate-950 hover:text-lime-600">
                    Read more →{article.readTime ? <span className="ml-2 font-normal text-slate-500">({article.readTime})</span> : null}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
