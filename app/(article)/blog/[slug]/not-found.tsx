import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-bold uppercase tracking-widest text-lime-600">404</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">Article Not Found</h1>
      <p className="mt-5 text-lg text-slate-600">This article may have been moved or unpublished.</p>
      <Link href="/blog" className="mt-8 inline-block rounded-lg bg-slate-950 px-7 py-3 font-bold text-white">Browse all articles</Link>
    </div>
  );
}
