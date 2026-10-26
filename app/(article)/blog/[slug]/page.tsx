import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteUrl } from "@/config/siteMetadata";
import { formatArticleDate, getArticleBySlug } from "@/lib/articles";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  const url = `${siteUrl}/blog/${encodeURIComponent(slug)}`;
  const title = article.metaTitle || article.title || "Blog";
  const description = article.metaDescription || article.subtitle || undefined;

  return {
    title: article.metaTitle ? { absolute: article.metaTitle } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "QC Tote Rental",
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.authorName ? [article.authorName] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="bg-slate-50">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/blog" className="font-bold text-slate-700 hover:text-lime-600">← All articles</Link>

        <header className="mt-8">
          {article.category && (
            <p className="text-sm font-bold uppercase tracking-widest text-lime-600">{article.category}</p>
          )}
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">{article.title}</h1>
          {article.subtitle && <p className="mt-5 text-xl leading-8 text-slate-600">{article.subtitle}</p>}
          <p className="mt-5 text-sm font-semibold text-slate-500">
            {[
              article.authorName,
              article.publishedAt && formatArticleDate(article.publishedAt),
              article.readTime,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </header>

        {article.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.imageUrl} alt={article.title ?? ""} className="mt-8 w-full rounded-2xl object-cover" />
        )}

        {/* HTML comes from the authenticated GrandRanker webhook. */}
        <div className="article-content mt-10" dangerouslySetInnerHTML={{ __html: article.contentHtml ?? "" }} />
      </article>

      <section className="bg-lime-400 py-14 text-center text-slate-950">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black">Ready to Skip the Cardboard?</h2>
          <p className="mt-3 text-lg">Reusable moving totes delivered to your door and picked up when you&apos;re done.</p>
          <Link href="/reserve" className="mt-7 inline-block rounded-lg bg-slate-950 px-7 py-3 font-bold text-white">Reserve Your Totes</Link>
        </div>
      </section>
    </div>
  );
}
