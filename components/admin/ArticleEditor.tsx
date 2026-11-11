"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedImageUpload from "@/components/admin/FeaturedImageUpload";

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
  const [form, setForm] = useState<ArticleForm>(() => ({
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
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-bold text-slate-700 hover:text-lime-600">← All articles</Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-black">{isEdit ? "Edit article" : "New article"}</h1>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => (preview ? setPreview(false) : openPreview())} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold">
              {preview ? "Edit" : "Preview"}
            </button>
            <button type="button" disabled={busy} onClick={() => save("draft")} className="rounded-lg border border-slate-950 px-5 py-3 font-bold disabled:opacity-50">Save draft</button>
            <button type="button" disabled={busy} onClick={() => save("publish")} className="rounded-lg bg-lime-400 px-5 py-3 font-black disabled:opacity-50">Publish / schedule</button>
            {isEdit && isPublished ? (
              <button type="button" disabled={busy} onClick={unpublish} className="rounded-lg bg-amber-100 px-5 py-3 font-bold text-amber-900 disabled:opacity-50">Unpublish</button>
            ) : null}
            {isEdit ? (
              <button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50">Delete permanently</button>
            ) : null}
          </div>
        </div>

        {message ? <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 font-semibold">{message}</div> : null}

        {preview ? (
          <article className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            {form.imageUrl ? <img src={form.imageUrl} alt="" className="mb-8 w-full rounded-2xl object-cover" /> : null}
            <h1 className="text-4xl font-black">{form.title || "Untitled article"}</h1>
            {form.subtitle ? <p className="mt-4 text-xl text-slate-600">{form.subtitle}</p> : null}
            <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: form.contentHtml }} />
          </article>
        ) : (
          <div className="mt-8 space-y-7 rounded-2xl bg-white p-8 shadow-sm">
            <label className={label}>Title
              <input value={form.title} onChange={(e) => updateTitle(e.target.value)} className={input} />
            </label>

            <label className={label}>Slug
              <div className="mt-2 flex gap-3">
                <input
                  value={form.slug}
                  onChange={(e) => { update("slug", e.target.value); setSlugManuallyEdited(true); }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950"
                />
                <button type="button" onClick={makeSlug} className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold">Create from title</button>
              </div>
            </label>

            <label className={label}>Subtitle
              <input value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} className={input} />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className={label}>Category
                <input value={form.category} onChange={(e) => update("category", e.target.value)} className={input} />
              </label>
              <label className={label}>Author
                <input value={form.authorName} onChange={(e) => update("authorName", e.target.value)} className={input} />
              </label>
            </div>

            <div>
              <p className={label}>Featured image</p>
              <div className="mt-2">
                <FeaturedImageUpload value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-600">Advanced: use an existing image URL</summary>
                <input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className={input} placeholder="https://..." />
              </details>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className={label}>Read time
                <input value={form.readTime} onChange={(e) => update("readTime", e.target.value)} className={input} placeholder="6 min read" />
              </label>
              <label className={label}>Publication date
                <input type="datetime-local" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} className={input} />
              </label>
            </div>

            <label className={label}>SEO title
              <input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} className={input} />
            </label>

            <label className={label}>Meta description
              <textarea value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} className={`${input} min-h-28`} />
              <span className="mt-1 block text-xs font-normal text-slate-500">{seoLength} characters</span>
            </label>

            <div>
              <p className={label}>Article content</p>
              <div className="mt-2 flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-slate-300 bg-slate-50 p-3">
                <button type="button" onClick={() => command("formatBlock", "h2")} className="rounded border bg-white px-3 py-1 font-bold">H2</button>
                <button type="button" onClick={() => command("formatBlock", "h3")} className="rounded border bg-white px-3 py-1 font-bold">H3</button>
                <button type="button" onClick={() => command("bold")} className="rounded border bg-white px-3 py-1 font-bold">Bold</button>
                <button type="button" onClick={() => command("insertUnorderedList")} className="rounded border bg-white px-3 py-1 font-bold">List</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                dir="ltr"
                suppressContentEditableWarning
                className="article-content min-h-96 rounded-b-lg border border-slate-300 bg-white p-5 text-left text-slate-950 [direction:ltr] [unicode-bidi:isolate]"
                style={{ direction: "ltr", textAlign: "left", unicodeBidi: "isolate" }}
                dangerouslySetInnerHTML={{ __html: form.contentHtml }}
                onInput={(event) => update("contentHtml", event.currentTarget.innerHTML)}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
