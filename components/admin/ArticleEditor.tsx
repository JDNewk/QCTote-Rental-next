"use client";

import Link from "next/link";
import {
  ChangeEvent,
  ClipboardEvent as ReactClipboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
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

type SaveMode = "draft" | "publishNow" | "schedule";

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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u",
  "ul", "ol", "li", "a", "blockquote", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
]);

function localDateTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatCentralDateTime(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(iso));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToHtml(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function dataUrlToFile(dataUrl: string, fileName: string) {
  const match = /^data:([^;,]+)(;base64)?,(.*)$/i.exec(dataUrl);
  if (!match) return null;

  const mimeType = match[1];
  const binary = match[2] ? atob(match[3]) : decodeURIComponent(match[3]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mimeType });
}

function widthInPixels(value: string) {
  const normalized = value.trim().toLowerCase();
  const number = Number.parseFloat(normalized);
  if (!Number.isFinite(number)) return null;
  if (normalized.endsWith("in")) return number * 96;
  if (normalized.endsWith("pt")) return number * (96 / 72);
  if (normalized.endsWith("cm")) return number * (96 / 2.54);
  if (normalized.endsWith("mm")) return number * (96 / 25.4);
  if (normalized.endsWith("px") || /^\d+(\.\d+)?$/.test(normalized)) return number;
  return null;
}

function normalizedImageWidth(image: HTMLImageElement) {
  const styleWidth = image.style.width || image.getAttribute("width") || "";
  const percentMatch = /^([0-9.]+)%$/.exec(styleWidth.trim());
  if (percentMatch) {
    const percent = Number.parseFloat(percentMatch[1]);
    if (percent <= 42) return 33;
    if (percent <= 62) return 50;
    if (percent <= 87) return 75;
    return 100;
  }

  const pixels = widthInPixels(styleWidth);
  if (pixels == null) return 100;
  if (pixels <= 280) return 33;
  if (pixels <= 440) return 50;
  if (pixels <= 660) return 75;
  return 100;
}

function applyResponsiveImageStyle(image: HTMLImageElement, width: number) {
  image.removeAttribute("width");
  image.removeAttribute("height");
  image.removeAttribute("class");
  image.setAttribute(
    "style",
    `display:block;width:${width}%;max-width:100%;height:auto;margin:1.5rem auto;`,
  );
  image.setAttribute("loading", "lazy");
}

function normalizeArticleHtml(html: string) {
  const documentHtml = new DOMParser().parseFromString(html, "text/html");

  documentHtml.body.querySelectorAll('[data-article-toc="true"]').forEach((element) => element.remove());

  documentHtml.body.querySelectorAll("li").forEach((item) => {
    Array.from(item.children).forEach((child) => {
      if (child.tagName.toLowerCase() === "p") {
        const paragraph = child as HTMLParagraphElement;
        if (!paragraph.textContent?.trim() && !paragraph.querySelector("img,br")) {
          paragraph.remove();
        } else if (item.children.length === 1) {
          paragraph.replaceWith(...Array.from(paragraph.childNodes));
        }
      }
    });
  });

  Array.from(documentHtml.body.children).forEach((element) => {
    if (element.tagName.toLowerCase() !== "p") return;
    const paragraph = element as HTMLParagraphElement;
    const isEmpty = !paragraph.textContent?.trim() && !paragraph.querySelector("img");
    if (!isEmpty) return;

    const previousTag = paragraph.previousElementSibling?.tagName.toLowerCase();
    const nextTag = paragraph.nextElementSibling?.tagName.toLowerCase();
    const structuralTags = new Set(["h2", "h3", "h4", "ul", "ol"]);

    if (structuralTags.has(previousTag ?? "") || structuralTags.has(nextTag ?? "")) {
      paragraph.remove();
    }
  });

  let previousWasEmpty = false;
  Array.from(documentHtml.body.children).forEach((element) => {
    const isEmptyParagraph =
      element.tagName.toLowerCase() === "p" &&
      !element.textContent?.trim() &&
      !element.querySelector("img");

    if (isEmptyParagraph && previousWasEmpty) {
      element.remove();
      return;
    }
    previousWasEmpty = isEmptyParagraph;
  });

  return documentHtml.body.innerHTML;
}

function prepareArticleHtml(html: string, includeTableOfContents: boolean) {
  const normalizedHtml = normalizeArticleHtml(html);
  const documentHtml = new DOMParser().parseFromString(normalizedHtml, "text/html");
  documentHtml.body.querySelectorAll('[data-article-toc="true"]').forEach((element) => element.remove());

  const headings = Array.from(documentHtml.body.querySelectorAll("h2"));
  const usedIds = new Set<string>();

  headings.forEach((heading, index) => {
    const baseId = slugify(heading.textContent ?? "") || `section-${index + 1}`;
    let uniqueId = baseId;
    let suffix = 2;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(uniqueId);
    heading.id = uniqueId;
  });

  if (includeTableOfContents && headings.length >= 2) {
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

function sanitizeWordHtml(html: string) {
  const source = new DOMParser().parseFromString(html, "text/html");
  const output = document.implementation.createHTMLDocument("");

  function clean(node: Node): Node[] {
    if (node.nodeType === Node.TEXT_NODE) {
      return [output.createTextNode(node.textContent ?? "")];
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const element = node as HTMLElement;
    let tag = element.tagName.toLowerCase();

    if (["script", "style", "meta", "link", "object", "iframe", "xml"].includes(tag)) {
      return [];
    }

    if (tag === "h1") tag = "h2";
    if (tag === "div") tag = "p";
    if (tag === "span" || !ALLOWED_TAGS.has(tag)) {
      return Array.from(element.childNodes).flatMap(clean);
    }

    const cleaned = output.createElement(tag);

    if (tag === "a") {
      const href = element.getAttribute("href") ?? "";
      if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(href)) {
        cleaned.setAttribute("href", href);
        if (/^https?:\/\//i.test(href)) {
          cleaned.setAttribute("target", "_blank");
          cleaned.setAttribute("rel", "noopener noreferrer");
        }
      }
    }

    if (tag === "img") {
      const image = element as HTMLImageElement;
      const sourceUrl = image.getAttribute("src") ?? "";
      if (/^(https?:\/\/|\/api\/article-images\/)/i.test(sourceUrl)) {
        cleaned.setAttribute("src", sourceUrl);
      }
      cleaned.setAttribute("alt", image.getAttribute("alt") ?? "");
      const style = image.getAttribute("style");
      if (style) cleaned.setAttribute("style", style);
      cleaned.setAttribute("loading", "lazy");
      return cleaned.hasAttribute("src") ? [cleaned] : [];
    }

    for (const child of Array.from(element.childNodes)) {
      for (const cleanedChild of clean(child)) cleaned.append(cleanedChild);
    }

    if (tag === "p" && !cleaned.textContent?.trim() && !cleaned.querySelector("img,br")) {
      cleaned.append(output.createElement("br"));
    }

    return [cleaned];
  }

  const container = output.createElement("div");
  for (const child of Array.from(source.body.childNodes)) {
    for (const cleanedChild of clean(child)) container.append(cleanedChild);
  }
  return normalizeArticleHtml(container.innerHTML);
}

export default function ArticleEditor({ initialArticle }: { initialArticle?: ArticleForm }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const initialPublishedAt = initialArticle?.publishedAt ?? "";
  const initialIsScheduled = Boolean(initialPublishedAt && new Date(initialPublishedAt) > new Date());

  const [form, setForm] = useState<ArticleForm>(() => ({
    ...empty,
    ...initialArticle,
    publishedAt: localDateTime(initialPublishedAt),
  }));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(initialIsScheduled);
  const [scheduledFor, setScheduledFor] = useState(localDateTime(initialPublishedAt));
  const [includeTableOfContents, setIncludeTableOfContents] = useState(
    initialArticle?.contentHtml?.includes('data-article-toc="true"') ?? true,
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialArticle?.slug));

  const isEdit = Boolean(initialArticle?.externalId);
  const isPublished = Boolean(initialPublishedAt && new Date(initialPublishedAt) <= new Date());
  const isScheduled = Boolean(initialPublishedAt && new Date(initialPublishedAt) > new Date());

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

  function rememberSelection() {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection?.rangeCount || !editor) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    rememberSelection();
  }

  function addLink() {
    const url = window.prompt("Enter the link URL:", "https://");
    if (!url) return;

    const trimmedUrl = url.trim();
    if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmedUrl)) {
      setMessage("Use a full web address beginning with https://, or a mailto:, tel:, or site-relative link.");
      return;
    }

    const editor = editorRef.current;
    const range = savedRangeRef.current?.cloneRange();
    if (!editor || !range || !editor.contains(range.commonAncestorContainer) || range.collapsed) {
      setMessage("Select the text you want to link, then choose Link.");
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("createLink", false, trimmedUrl);

    const anchor = selection?.anchorNode?.parentElement?.closest("a");
    if (anchor && /^https?:\/\//i.test(trimmedUrl)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
    rememberSelection();
    setMessage("Link added.");
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/images", { method: "POST", body: formData });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result?.url) {
      throw new Error(result?.error || "The image could not be uploaded.");
    }
    return String(result.url);
  }

  function insertHtml(html: string, rangeOverride?: Range | null) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    let range = rangeOverride?.cloneRange() ?? savedRangeRef.current?.cloneRange() ?? null;

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }

    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;
    range.insertNode(fragment);

    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }
  }

  async function insertBodyImage(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const url = await uploadImage(file);
      const alt = window.prompt("Describe this image for accessibility:", "") ?? "";
      const requestedWidth = Number.parseInt(
        window.prompt("Image width: enter 33, 50, 75, or 100", "75") ?? "75",
        10,
      );
      const width = [33, 50, 75, 100].includes(requestedWidth) ? requestedWidth : 75;
      insertHtml(
        `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" style="display:block;width:${width}%;max-width:100%;height:auto;margin:1.5rem auto;"><p><br></p>`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be inserted.");
    } finally {
      setBusy(false);
      if (bodyImageInputRef.current) bodyImageInputRef.current.value = "";
    }
  }

  async function handleBodyImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await insertBodyImage(file);
  }

  async function handleRichPaste(event: ReactClipboardEvent<HTMLDivElement>) {
    const clipboard = event.clipboardData;
    const html = clipboard.getData("text/html");
    const plainText = clipboard.getData("text/plain");
    const clipboardImages = Array.from(clipboard.files).filter((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type),
    );

    if (!html && clipboardImages.length === 0) return;

    event.preventDefault();
    const pasteRange = window.getSelection()?.rangeCount
      ? window.getSelection()!.getRangeAt(0).cloneRange()
      : savedRangeRef.current?.cloneRange() ?? null;

    setPasting(true);
    setMessage(clipboardImages.length ? "Uploading pasted images..." : "Cleaning Word formatting...");

    try {
      const source = new DOMParser().parseFromString(html || plainTextToHtml(plainText), "text/html");
      const sourceImages = Array.from(source.body.querySelectorAll("img"));
      let fileIndex = 0;

      for (let index = 0; index < sourceImages.length; index += 1) {
        const image = sourceImages[index];
        const src = image.getAttribute("src") ?? "";
        const width = normalizedImageWidth(image);
        let permanentUrl = src;

        if (src.startsWith("data:image/")) {
          const file = dataUrlToFile(src, `word-paste-${Date.now()}-${index}.png`);
          if (file) permanentUrl = await uploadImage(file);
        } else if (!/^https?:\/\//i.test(src) && fileIndex < clipboardImages.length) {
          permanentUrl = await uploadImage(clipboardImages[fileIndex]);
          fileIndex += 1;
        }

        if (/^https?:\/\//i.test(permanentUrl) || permanentUrl.startsWith("/api/article-images/")) {
          image.setAttribute("src", permanentUrl);
          applyResponsiveImageStyle(image, width);
        } else {
          image.remove();
        }
      }

      while (fileIndex < clipboardImages.length) {
        const file = clipboardImages[fileIndex];
        const permanentUrl = await uploadImage(file);
        const paragraph = source.createElement("p");
        const image = source.createElement("img");
        image.setAttribute("src", permanentUrl);
        image.setAttribute("alt", "");
        applyResponsiveImageStyle(image, 100);
        paragraph.append(image);
        source.body.append(paragraph);
        fileIndex += 1;
      }

      const cleanedHtml = sanitizeWordHtml(source.body.innerHTML);
      insertHtml(normalizeArticleHtml(cleanedHtml || plainTextToHtml(plainText)), pasteRange);
      setMessage("Word content pasted. Formatting was cleaned and images were uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The Word content could not be pasted.");
      if (plainText) insertHtml(plainTextToHtml(plainText), pasteRange);
    } finally {
      setPasting(false);
    }
  }

  function openPreview() {
    const rawHtml = editorRef.current?.innerHTML ?? form.contentHtml;
    const contentHtml = prepareArticleHtml(rawHtml, includeTableOfContents);
    if (editorRef.current) editorRef.current.innerHTML = contentHtml;
    setForm((current) => ({ ...current, contentHtml }));
    setPreview(true);
  }

  async function save(mode: SaveMode) {
    if (mode === "schedule") {
      if (!scheduledFor) {
        setMessage("Choose a future publication date and time.");
        return;
      }
      const scheduledDate = new Date(scheduledFor);
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        setMessage("The scheduled publication time must be in the future.");
        return;
      }
    }

    setBusy(true);
    setMessage("");

    const rawHtml = editorRef.current?.innerHTML ?? form.contentHtml;
    const contentHtml = prepareArticleHtml(rawHtml, includeTableOfContents);
    if (editorRef.current) editorRef.current.innerHTML = contentHtml;
    const publishedAt =
      mode === "draft"
        ? null
        : mode === "publishNow"
          ? new Date().toISOString()
          : new Date(scheduledFor).toISOString();

    const payload = {
      ...form,
      publishedAt,
      contentHtml,
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

    if (mode === "draft") {
      setMessage("Article unpublished and saved as a draft.");
    } else if (mode === "publishNow") {
      setMessage("Article published.");
      setScheduleOpen(false);
    } else {
      setMessage(`Article scheduled for ${formatCentralDateTime(publishedAt!)} Central Time.`);
      setScheduleOpen(false);
    }

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
    if (!window.confirm(`Delete "${form.title || "this article"}" permanently? This cannot be undone.`)) return;
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
        <Link href="/admin" className="font-bold text-slate-700 hover:text-lime-600">Back to all articles</Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black">{isEdit ? "Edit article" : "New article"}</h1>
            {isScheduled ? (
              <p className="mt-2 font-semibold text-blue-700">
                Scheduled for {formatCentralDateTime(initialPublishedAt)} Central Time
              </p>
            ) : isPublished ? (
              <p className="mt-2 font-semibold text-lime-700">
                Published {formatCentralDateTime(initialPublishedAt)} Central Time
              </p>
            ) : (
              <p className="mt-2 font-semibold text-slate-500">Draft</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => (preview ? setPreview(false) : openPreview())} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold">
              {preview ? "Edit" : "Preview"}
            </button>
            <button type="button" disabled={busy || pasting} onClick={() => save("draft")} className="rounded-lg border border-slate-950 px-5 py-3 font-bold disabled:opacity-50">
              Save draft
            </button>
            <button type="button" disabled={busy || pasting} onClick={() => save("publishNow")} className="rounded-lg bg-lime-400 px-5 py-3 font-black disabled:opacity-50">
              Publish now
            </button>
            <button
              type="button"
              disabled={busy || pasting}
              onClick={() => setScheduleOpen((current) => !current)}
              className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              {isScheduled ? "Reschedule..." : "Schedule..."}
            </button>
            {isEdit && (isPublished || isScheduled) ? (
              <button type="button" disabled={busy || pasting} onClick={unpublish} className="rounded-lg bg-amber-100 px-5 py-3 font-bold text-amber-900 disabled:opacity-50">
                {isScheduled ? "Cancel schedule" : "Unpublish"}
              </button>
            ) : null}
            {isEdit ? (
              <button type="button" disabled={busy || pasting} onClick={remove} className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50">
                Delete permanently
              </button>
            ) : null}
          </div>
        </div>

        {scheduleOpen ? (
          <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-xl font-black text-slate-950">Schedule publication</h2>
            <p className="mt-2 text-sm text-slate-600">Choose the publication date and time in Central Time.</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="block flex-1 text-sm font-bold text-slate-700">
                Publication date and time
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                  className={input}
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy || pasting || !scheduledFor}
                  onClick={() => save("schedule")}
                  className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  Schedule article
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {message ? <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 font-semibold">{message}</div> : null}

        {preview ? (
          <article className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
            {form.imageUrl ? <img src={form.imageUrl} alt="" className="mx-auto mb-8 max-h-[500px] w-full rounded-2xl object-contain sm:w-3/4" /> : null}
            <h1 className="text-4xl font-black">{form.title || "Untitled article"}</h1>
            {form.subtitle ? <p className="mt-4 text-xl text-slate-600">{form.subtitle}</p> : null}
            <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: form.contentHtml }} />
          </article>
        ) : (
          <div className="mt-8 space-y-7 rounded-2xl bg-white p-8 shadow-sm">
            <label className={label}>Title
              <input value={form.title} onChange={(event) => updateTitle(event.target.value)} className={input} />
            </label>

            <label className={label}>Slug
              <div className="mt-2 flex gap-3">
                <input
                  value={form.slug}
                  onChange={(event) => { update("slug", event.target.value); setSlugManuallyEdited(true); }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950"
                />
                <button type="button" onClick={makeSlug} className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold">Create from title</button>
              </div>
            </label>

            <label className={label}>Subtitle
              <input value={form.subtitle} onChange={(event) => update("subtitle", event.target.value)} className={input} />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className={label}>Category
                <input value={form.category} onChange={(event) => update("category", event.target.value)} className={input} />
              </label>
              <label className={label}>Author
                <input value={form.authorName} onChange={(event) => update("authorName", event.target.value)} className={input} />
              </label>
            </div>

            <div>
              <p className={label}>Featured image</p>
              <div className="mt-2">
                <FeaturedImageUpload value={form.imageUrl} onChange={(url) => update("imageUrl", url)} />
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-600">Advanced: use an existing image URL</summary>
                <input value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} className={input} placeholder="https://..." />
              </details>
            </div>

            <label className={label}>Read time
              <input value={form.readTime} onChange={(event) => update("readTime", event.target.value)} className={input} placeholder="6 min read" />
            </label>

            <label className={label}>SEO title
              <input value={form.metaTitle} onChange={(event) => update("metaTitle", event.target.value)} className={input} />
            </label>

            <label className={label}>Meta description
              <textarea value={form.metaDescription} onChange={(event) => update("metaDescription", event.target.value)} className={`${input} min-h-28`} />
              <span className="mt-1 block text-xs font-normal text-slate-500">{seoLength} characters</span>
            </label>

            <div>
              <p className={label}>Article content</p>
              <p className="mt-2 text-sm text-slate-500">
                Paste a formatted article from Word. Headings, bold text, lists, links, tables, and images will be cleaned for the website. Pasted images are uploaded automatically.
              </p>
              <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeTableOfContents}
                  onChange={(event) => setIncludeTableOfContents(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-lime-500"
                />
                <span>
                  Add a clickable table of contents from Heading 2 sections.
                  <span className="mt-1 block font-normal text-slate-500">The table appears when the article has at least two H2 headings.</span>
                </span>
              </label>
              <div className="sticky top-3 z-30 mt-3 flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-slate-50/95 p-3 shadow-md backdrop-blur">
                <button type="button" onClick={() => command("formatBlock", "h2")} className="rounded border bg-white px-3 py-1 font-bold">H2</button>
                <button type="button" onClick={() => command("formatBlock", "h3")} className="rounded border bg-white px-3 py-1 font-bold">H3</button>
                <button type="button" onClick={() => command("bold")} className="rounded border bg-white px-3 py-1 font-bold">Bold</button>
                <button type="button" onClick={() => command("insertUnorderedList")} className="rounded border bg-white px-3 py-1 font-bold">List</button>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    rememberSelection();
                  }}
                  onClick={addLink}
                  className="rounded border bg-white px-3 py-1 font-bold"
                >
                  Link
                </button>
                <button
                  type="button"
                  disabled={busy || pasting}
                  onMouseDown={rememberSelection}
                  onClick={() => bodyImageInputRef.current?.click()}
                  className="rounded border bg-white px-3 py-1 font-bold disabled:opacity-50"
                >
                  Insert image
                </button>
                <input
                  ref={bodyImageInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleBodyImageChange}
                />
                {pasting ? <span className="px-2 py-1 text-sm font-bold text-lime-700">Processing Word paste...</span> : null}
              </div>
              <div
                ref={editorRef}
                contentEditable={!pasting}
                dir="ltr"
                suppressContentEditableWarning
                className="article-content min-h-96 rounded-b-lg border border-slate-300 bg-white p-5 text-left text-slate-950 [direction:ltr] [unicode-bidi:isolate]"
                style={{ direction: "ltr", textAlign: "left", unicodeBidi: "isolate" }}
                dangerouslySetInnerHTML={{ __html: form.contentHtml }}
                onPaste={handleRichPaste}
                onKeyUp={rememberSelection}
                onMouseUp={rememberSelection}
                onFocus={rememberSelection}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
