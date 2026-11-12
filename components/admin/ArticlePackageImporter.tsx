"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type ArticleImagePlan = {
  id: string;
  kind: "featured" | "body";
  recommendation: string;
  location?: string;
  width?: 33 | 50 | 75 | 100;
  altText?: string;
  required?: boolean;
  generationPrompt?: string;
  useQcToteReference?: boolean;
};

export type ArticlePackage = {
  version?: number;
  title: string;
  slug?: string;
  subtitle?: string;
  category?: string;
  authorName?: string;
  imageUrl?: string;
  readTime?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml: string;
  includeTableOfContents?: boolean;
  images?: ArticleImagePlan[];
};

type SelectedImages = Record<string, File | undefined>;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function addTableOfContents(html: string) {
  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  documentHtml.body.querySelectorAll('[data-article-toc="true"]').forEach((element) => element.remove());
  const headings = Array.from(documentHtml.body.querySelectorAll("h2"));
  const usedIds = new Set<string>();
  headings.forEach((heading, index) => {
    const baseId = slugify(heading.textContent ?? "") || `section-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) { id = `${baseId}-${suffix}`; suffix += 1; }
    usedIds.add(id);
    heading.id = id;
  });
  if (headings.length >= 2) {
    const navigation = documentHtml.createElement("nav");
    navigation.setAttribute("data-article-toc", "true");
    navigation.setAttribute("aria-label", "Table of contents");
    navigation.className = "article-toc";
    const title = documentHtml.createElement("p");
    title.className = "article-toc-title";
    title.textContent = "In this article";
    navigation.append(title);
    const list = documentHtml.createElement("ol");
    headings.forEach((heading) => {
      const item = documentHtml.createElement("li");
      const link = documentHtml.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent?.trim() || "Article section";
      item.append(link);
      list.append(item);
    });
    navigation.append(list);
    headings[0].before(navigation);
  }
  return documentHtml.body.innerHTML;
}

function validatePackage(value: unknown): ArticlePackage {
  if (!value || typeof value !== "object") throw new Error("The selected file is not a valid article package.");
  const article = value as Partial<ArticlePackage>;
  if (article.version != null && ![1, 2].includes(article.version)) throw new Error("This article package version is not supported.");
  if (!article.title?.trim()) throw new Error("The article package is missing a title.");
  if (!article.contentHtml?.trim()) throw new Error("The article package is missing article content.");
  const imageIds = new Set<string>();
  for (const image of article.images ?? []) {
    if (!image.id?.trim()) throw new Error("Every image recommendation must have an id.");
    if (imageIds.has(image.id)) throw new Error(`The image id "${image.id}" is duplicated.`);
    if (image.kind !== "featured" && image.kind !== "body") throw new Error(`The image recommendation "${image.id}" has an unsupported kind.`);
    imageIds.add(image.id);
  }
  return article as ArticlePackage;
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/admin/images", { method: "POST", body: formData });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result?.url) throw new Error(result?.error || `The image "${file.name}" could not be uploaded.`);
  return String(result.url);
}

function replaceBodyImageMarkers(html: string, imagePlans: ArticleImagePlan[], uploadedUrls: Record<string, string>) {
  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  const bodyPlans = new Map(imagePlans.filter((image) => image.kind === "body").map((image) => [image.id, image]));
  const walker = documentHtml.createTreeWalker(documentHtml.body, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  let current = walker.nextNode();
  while (current) { comments.push(current as Comment); current = walker.nextNode(); }
  for (const comment of comments) {
    const match = /^\s*ARTICLE_IMAGE:([a-zA-Z0-9_-]+)\s*$/.exec(comment.data);
    if (!match) continue;
    const id = match[1];
    const plan = bodyPlans.get(id);
    const url = uploadedUrls[id];
    if (!plan || !url) { comment.remove(); continue; }
    const image = documentHtml.createElement("img");
    const width = plan.width ?? 75;
    image.setAttribute("src", url);
    image.setAttribute("alt", plan.altText ?? "");
    image.setAttribute("loading", "lazy");
    image.setAttribute("style", `display:block;width:${width}%;max-width:100%;height:auto;margin:1.5rem auto;`);
    const paragraph = documentHtml.createElement("p");
    paragraph.append(image);
    comment.replaceWith(paragraph);
  }
  return documentHtml.body.innerHTML;
}

export default function ArticlePackageImporter({ initialPackage = null, packageName }: { initialPackage?: ArticlePackage | null; packageName?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [articlePackage, setArticlePackage] = useState<ArticlePackage | null>(() => initialPackage ? validatePackage(initialPackage) : null);
  const [packageFileName, setPackageFileName] = useState(packageName ?? (initialPackage ? "Prepared from publishing calendar" : ""));
  const [selectedImages, setSelectedImages] = useState<SelectedImages>({});

  async function loadPackage(file: File) {
    setMessage("");
    try {
      const parsed = validatePackage(JSON.parse(await file.text()));
      setArticlePackage(parsed);
      setPackageFileName(file.name);
      setSelectedImages({});
    } catch (error) {
      setArticlePackage(null); setPackageFileName(""); setSelectedImages({});
      setMessage(error instanceof Error ? error.message : "The article package could not be loaded.");
    } finally { if (inputRef.current) inputRef.current.value = ""; }
  }

  function chooseImage(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedImages((current) => ({ ...current, [id]: file }));
  }

  async function createDraft() {
    if (!articlePackage) return;
    setBusy(true); setMessage("");
    try {
      for (const image of articlePackage.images ?? []) {
        if (image.required && !selectedImages[image.id]) throw new Error(`Choose an image for "${image.recommendation}" before creating the draft.`);
      }
      const uploadedUrls: Record<string, string> = {};
      for (const image of articlePackage.images ?? []) {
        const file = selectedImages[image.id];
        if (file) uploadedUrls[image.id] = await uploadImage(file);
      }
      const slug = slugify(articlePackage.slug?.trim() || articlePackage.title);
      if (!slug) throw new Error("The article package could not create a valid slug.");
      const featuredPlan = (articlePackage.images ?? []).find((image) => image.kind === "featured");
      const imageUrl = featuredPlan ? uploadedUrls[featuredPlan.id] ?? articlePackage.imageUrl ?? "" : articlePackage.imageUrl ?? "";
      let contentHtml = replaceBodyImageMarkers(articlePackage.contentHtml, articlePackage.images ?? [], uploadedUrls);
      if (articlePackage.includeTableOfContents !== false) contentHtml = addTableOfContents(contentHtml);
      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: articlePackage.title, slug, subtitle: articlePackage.subtitle ?? "", category: articlePackage.category ?? "Moving Tips",
          authorName: articlePackage.authorName ?? "QC Tote Rental Editorial Team", imageUrl, readTime: articlePackage.readTime ?? "",
          metaTitle: articlePackage.metaTitle ?? articlePackage.title, metaDescription: articlePackage.metaDescription ?? articlePackage.subtitle ?? "",
          contentHtml, publishedAt: null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.externalId) throw new Error(result?.error || "The article package could not be imported.");
      router.push(`/admin/articles/${encodeURIComponent(result.externalId)}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The article package could not be imported.");
    } finally { setBusy(false); }
  }

  const imagePlans = articlePackage?.images ?? [];

  return (
    <section className="mb-8 rounded-2xl border border-lime-300 bg-lime-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">{initialPackage ? "Prepared article package" : "Import article package"}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Review the article and image plan, choose images, and create a draft. You can still choose a different JSON package.</p>
        </div>
        <div className="shrink-0">
          <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadPackage(file); }} disabled={busy} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">
            {articlePackage ? "Choose a different package" : "Choose article package"}
          </button>
        </div>
      </div>

      {articlePackage ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-lime-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-lime-700">Loaded package</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">{articlePackage.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{packageFileName}</p>
          </div>

          {imagePlans.length ? (
            <div>
              <h3 className="text-xl font-black text-slate-950">Images for this article</h3>
              <p className="mt-1 text-sm text-slate-600">Choose prepared/generated images now, or skip optional body images and add them later.</p>
              <div className="mt-4 grid gap-4">
                {imagePlans.map((image, index) => {
                  const selectedFile = selectedImages[image.id];
                  return (
                    <div key={image.id} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{index + 1}. {image.kind === "featured" ? "Featured image" : "Body image"}{image.required ? " - Required" : " - Optional"}</p>
                          <p className="mt-2 font-bold text-slate-950">{image.recommendation}</p>
                          {image.location ? <p className="mt-2 text-sm text-slate-600"><strong>Location:</strong> {image.location}</p> : null}
                          {image.kind === "body" ? <p className="mt-1 text-sm text-slate-600"><strong>Suggested width:</strong> {image.width ?? 75}%</p> : null}
                          {image.altText ? <p className="mt-1 text-sm text-slate-600"><strong>Alt text:</strong> {image.altText}</p> : null}
                          {image.generationPrompt ? (
                            <details className="mt-3 rounded-lg bg-slate-50 p-3">
                              <summary className="cursor-pointer text-sm font-bold text-slate-700">View image-generation prompt</summary>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{image.generationPrompt}</p>
                            </details>
                          ) : null}
                        </div>
                        <div className="min-w-56">
                          <label className="block cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-800 hover:border-lime-500">
                            {selectedFile ? "Change image" : "Choose image"}
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => chooseImage(image.id, event)} disabled={busy} />
                          </label>
                          {selectedFile ? (
                            <div className="mt-2 text-center">
                              <p className="truncate text-xs text-slate-600">{selectedFile.name}</p>
                              <button type="button" onClick={() => setSelectedImages((current) => ({ ...current, [image.id]: undefined }))} className="mt-2 text-xs font-bold text-red-700 underline">Remove selection</button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void createDraft()} disabled={busy} className="rounded-lg bg-lime-400 px-6 py-3 font-black text-slate-950 disabled:opacity-60">{busy ? "Creating draft..." : "Create draft"}</button>
            <button type="button" onClick={() => { setArticlePackage(null); setPackageFileName(""); setSelectedImages({}); setMessage(""); }} disabled={busy} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60">Cancel import</button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm font-semibold text-red-700">{message}</p> : null}
    </section>
  );
}
