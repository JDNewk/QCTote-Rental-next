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
  title: "",
  slug: "",
  subtitle: "",
  category: "Moving Tips",
  authorName: "QC Tote Rental Editorial Team",
  imageUrl: "",
  readTime: "",
  metaTitle: "",
  metaDescription: "",
  contentHtml: "",
  publishedAt: "",
};

function localDateTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArticleEditor({ initialArticle }: { initialArticle?: ArticleForm }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(() => ({
    ...empty,
    ...initialArticle,
    publishedAt: localDateTime(initialArticle?.publishedAt ?? ""),
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialArticle?.slug));
  const isEdit = Boolean(initialArticle?.externalId);
  const isPublished = Boolean(initialArticle?.publishedAt && new Date(initialArticle.publishedAt) <= new Date());

  function update<K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTitle(title: string) {
    setForm((current) => ({
      ...current,
      title,
      slug: !isEdit && !slugManuallyEdited ? slugify(title) : current.slug,
    }));
  }

  function makeSlug() {
    update("slug", slugify(form.title));
    setSlugManuallyEdited(true);
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    update("contentHtml", editorRef.current?.innerHTML ?? "");
  }

  function openPreview() {
    setForm((current) => ({
      ...current,
      contentHtml: editorRef.current?.innerHTML ?? current.contentHtml,
    }));
    setPreview(true);
  }

  async function save(mode: "draft" | "publish") {
    setBusy(true);
    setMessage("");
    const payload = {
      ...form,
      publishedAt:
        mode === "draft"
          ? null
          : form.publishedAt
            ? new Date(form.publishedAt).toISOString()
            : new Date().toISOString(),
      contentHtml: editorRef.current?.innerHTML ?? form.contentHtml,
    };
    const url = isEdit
      ? `/api/admin/articles/${encodeURIComponent(initialArticle!.externalId!)}`
      : "/api/admin/articles";
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
    setMessage(mode === "draft" ? "Article unpublished and saved as a draft." : "Article saved for publication.");
    if (!isEdit && result.externalId) {
      router.replace(`/admin/articles/${encodeURIComponent(result.externalId)}`);
    }
    router.refresh();
  }

  async function unpublish() {
    if (!isEdit) return;
    if (!window.confirm("Unpublish this article? It will be removed from the public blog and sitemap, but will remain editable here.")) return;
    await save("draft");
  }

  async function remove() {
    if (!isEdit) return;
    if (!window.confirm(`Delete “${form.title || "this article"}” permanently? This cannot be undone.`)) return;
    setBusy(true);
    setMessage("");
    const response = await fetch(
      `/api/admin/articles/${encodeURIComponent(initialArticle!.externalId!)}`,
      { method: "DELETE" },
    );
    setBusy(false);
    if (response.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setMessage("The article could not be deleted.");
    }
  }

  const seoLength = useMemo(() => form.metaDescription.length, [form.metaDescription]);
  const input = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950";
  const label = "block text-sm font-bold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="font-bold text-slate-600 hover:text-lime-600">← All articles</Link>
            <h1 className="mt-3 text-4xl font-black text-slate-950">{isEdit ? "Edit article" : "New article"}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => (preview ? setPreview(false) : openPreview())} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold">
              {preview ? "Edit" : "Preview"}
            </button>
            <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-lg border border-slate-950 px-5 py-3 font-bold disabled:opacity-50">
              Save draft
            </button>
            <button type="button" disabled={busy} onClick={() => save("publish")} className="rounded-lg bg-lime-400 px-5 py-3 font-black disabled:opacity-50">
              Publish / schedule
            </button>
            {isEdit && isPublished ? (
              <button type="button" disabled={busy} onClick={unpublish} className="rounded-lg border border-amber-500 bg-amber-50 px-5 py-3 font-bold text-amber-800 disabled:opacity-50">
                Unpublish
              </button>
            ) : null}
            {isEdit ? (
              <button type="button" disabled={busy} onClick={remove} className="rounded-lg border border-red-600 bg-red-50 px-5 py-3 font-bold text-red-700 disabled:opacity-50">
                Delete permanently
              </button>
            ) : null}
          </div>
        </div>

        {message ? <p className="mt-5 rounded-lg bg-white p-4 font-semibold text-slate-700 shadow-sm">{message}</p> : null}

        {preview ? (
          <article className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-black text-slate-950">{form.title || "Untitled article"}</h1>
            {form.subtitle ? <p className="mt-4 text-xl text-slate-600">{form.subtitle}</p> : null}
            {form.imageUrl ? <img src={form.imageUrl} alt="" className="mt-7 w-full rounded-2xl" /> : null}
            <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: form.contentHtml }} />
          </article>
        ) : (
          <div className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-sm">
            <label className={label}>Title
              <input className={input} value={form.title} onChange={(e) => updateTitle(e.target.value)} />
            </label>

            <label className={label}>Slug
              <div className="mt-2 flex gap-2">
                <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950" value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); update("slug", slugify(e.target.value)); }} />
                <button type="button" onClick={makeSlug} className="shrink-0 rounded-lg border border-slate-300 px-4 font-bold">Create from title</button>
              </div>
              <span className="mt-1 block text-xs font-normal text-slate-500">Public URL: /blog/{form.slug || "your-article-slug"}</span>
            </label>

            <label className={label}>Subtitle
              <input className={input} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={label}>Category
                <input className={input} value={form.category} onChange={(e) => update("category", e.target.value)} />
              </label>
              <label className={label}>Author
                <input className={input} value={form.authorName} onChange={(e) => update("authorName", e.target.value)} />
              </label>
              <label className={label}>Featured image URL
                <input className={input} value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} />
              </label>
              <label className={label}>Read time
                <input className={input} placeholder="5 min read" value={form.readTime} onChange={(e) => update("readTime", e.target.value)} />
              </label>
            </div>

            <label className={label}>SEO title
              <input className={input} value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} />
            </label>

            <label className={label}>Meta description
              <textarea className={`${input} min-h-24`} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} />
              <span className="mt-1 block text-xs font-normal text-slate-500">{seoLength} characters</span>
            </label>

            <label className={label}>Publish / schedule date
              <input type="datetime-local" className={input} value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
            </label>

            <div>
              <p className={label}>Article content</p>
              <div className="mt-2 flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-slate-300 bg-slate-50 p-2">
                <button type="button" onClick={() => command("formatBlock", "h2")} className="rounded border bg-white px-3 py-1 font-bold">H2</button>
                <button type="button" onClick={() => command("formatBlock", "h3")} className="rounded border bg-white px-3 py-1 font-bold">H3</button>
                <button type="button" onClick={() => command("bold")} className="rounded border bg-white px-3 py-1 font-bold">Bold</button>
                <button type="button" onClick={() => command("insertUnorderedList")} className="rounded border bg-white px-3 py-1 font-bold">Bullets</button>
                <button type="button" onClick={() => command("insertOrderedList")} className="rounded border bg-white px-3 py-1 font-bold">Numbers</button>
                <button type="button" onClick={() => { const url = window.prompt("Link URL"); if (url) command("createLink", url); }} className="rounded border bg-white px-3 py-1 font-bold">Link</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: form.contentHtml }}
                onInput={() => update("contentHtml", editorRef.current?.innerHTML ?? "")}
                className="article-content min-h-96 rounded-b-lg border border-slate-300 bg-white p-5 outline-none focus:border-lime-500"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
