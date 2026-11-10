"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ArticleForm = {
  externalId?: string;
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  authorName: string;
  imageUrl: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  contentHtml: string;
  publishedAt: string;
};

const empty: ArticleForm = {
  title: "", slug: "", subtitle: "", category: "Moving Tips",
  authorName: "QC Tote Rental Editorial Team", imageUrl: "", readTime: "",
  metaTitle: "", metaDescription: "", contentHtml: "", publishedAt: "",
};

function localDateTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function ArticleEditor({ initialArticle }: { initialArticle?: ArticleForm }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<ArticleForm>(() => ({ ...empty, ...initialArticle, publishedAt: localDateTime(initialArticle?.publishedAt ?? "") }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const isEdit = Boolean(initialArticle?.externalId);

  function update<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function makeSlug() {
    update("slug", form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    update("contentHtml", editorRef.current?.innerHTML ?? "");
  }

  function openPreview() {
    setForm((current) => ({ ...current, contentHtml: editorRef.current?.innerHTML ?? current.contentHtml }));
    setPreview(true);
  }

  async function save(mode: "draft" | "publish") {
    setBusy(true);
    setMessage("");
    const payload = {
      ...form,
      publishedAt: mode === "draft" ? null : (form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString()),
      contentHtml: editorRef.current?.innerHTML ?? form.contentHtml,
    };
    const url = isEdit ? `/api/admin/articles/${encodeURIComponent(initialArticle!.externalId!)}` : "/api/admin/articles";
    const response = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(result.error || "The article could not be saved.");
      return;
    }
    setMessage(mode === "draft" ? "Draft saved." : "Article saved for publication.");
    if (!isEdit && result.externalId) router.replace(`/admin/articles/${encodeURIComponent(result.externalId)}`);
    router.refresh();
  }

  async function remove() {
    if (!isEdit || !window.confirm("Delete this article permanently?")) return;
    const response = await fetch(`/api/admin/articles/${encodeURIComponent(initialArticle!.externalId!)}`, { method: "DELETE" });
    if (response.ok) router.replace("/admin");
    else setMessage("The article could not be deleted.");
  }

  const seoLength = useMemo(() => form.metaDescription.length, [form.metaDescription]);
  const input = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3";
  const label = "block text-sm font-bold text-slate-700";

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="font-bold text-slate-600 hover:text-lime-600">← All articles</Link>
          <h1 className="mt-2 text-4xl font-black">{isEdit ? "Edit article" : "New article"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => preview ? setPreview(false) : openPreview()} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold">{preview ? "Edit" : "Preview"}</button>
          <button disabled={busy} onClick={() => save("draft")} className="rounded-lg border border-slate-950 px-5 py-3 font-bold">Save draft</button>
          <button disabled={busy} onClick={() => save("publish")} className="rounded-lg bg-lime-400 px-5 py-3 font-black">Publish / schedule</button>
        </div>
      </div>

      {message && <p className="mt-5 rounded-lg bg-white p-4 font-bold shadow-sm">{message}</p>}

      {preview ? (
        <article className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white px-6 py-12 shadow-sm">
          {form.category && <p className="text-sm font-bold uppercase tracking-widest text-lime-600">{form.category}</p>}
          <h1 className="mt-3 text-4xl font-black">{form.title || "Untitled article"}</h1>
          {form.subtitle && <p className="mt-5 text-xl leading-8 text-slate-600">{form.subtitle}</p>}
          {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-8 w-full rounded-2xl" />}
          <div className="article-content mt-10" dangerouslySetInnerHTML={{ __html: form.contentHtml }} />
        </article>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <label className={label}>Title<input className={input} value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className={label}>Slug<input className={input} value={form.slug} onChange={(e) => update("slug", e.target.value)} /></label>
              <button onClick={makeSlug} className="rounded-lg border border-slate-300 px-4 py-3 font-bold">Create from title</button>
            </div>
            <label className={label}>Subtitle<textarea className={input} rows={2} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></label>
            <div>
              <p className={label}>Article content</p>
              <div className="mt-2 flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-slate-300 bg-slate-50 p-2">
                <button onClick={() => command("formatBlock", "h2")} className="rounded bg-white px-3 py-2 font-bold">H2</button>
                <button onClick={() => command("formatBlock", "h3")} className="rounded bg-white px-3 py-2 font-bold">H3</button>
                <button onClick={() => command("bold")} className="rounded bg-white px-3 py-2 font-bold">Bold</button>
                <button onClick={() => command("insertUnorderedList")} className="rounded bg-white px-3 py-2 font-bold">Bullets</button>
                <button onClick={() => command("insertOrderedList")} className="rounded bg-white px-3 py-2 font-bold">Numbers</button>
                <button onClick={() => { const url = window.prompt("Link URL"); if (url) command("createLink", url); }} className="rounded bg-white px-3 py-2 font-bold">Link</button>
                <button onClick={() => command("removeFormat")} className="rounded bg-white px-3 py-2 font-bold">Clear format</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => update("contentHtml", e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: form.contentHtml }}
                className="article-content min-h-[520px] rounded-b-lg border border-slate-300 bg-white p-5 outline-none focus:border-lime-500"
              />
              <p className="mt-2 text-sm text-slate-500">Paste approved content from Word, then use Preview to check spacing, headings, links and lists.</p>
            </div>
          </section>

          <aside className="space-y-5 rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-2xl font-black">Article settings</h2>
            <label className={label}>Category<input className={input} value={form.category} onChange={(e) => update("category", e.target.value)} /></label>
            <label className={label}>Author<input className={input} value={form.authorName} onChange={(e) => update("authorName", e.target.value)} /></label>
            <label className={label}>Featured image URL<input className={input} type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} /></label>
            <label className={label}>Read time<input className={input} placeholder="6 min read" value={form.readTime} onChange={(e) => update("readTime", e.target.value)} /></label>
            <label className={label}>Publish date and time<input className={input} type="datetime-local" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} /></label>
            <hr className="border-slate-200" />
            <h2 className="text-2xl font-black">SEO</h2>
            <label className={label}>Meta title<input className={input} value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} /></label>
            <label className={label}>Meta description<textarea className={input} rows={4} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} /><span className="mt-1 block font-normal text-slate-500">{seoLength} characters</span></label>
            {isEdit && <button onClick={remove} className="w-full rounded-lg border border-red-300 px-4 py-3 font-bold text-red-700">Delete article</button>}
          </aside>
        </div>
      )}
    </main>
  );
}
