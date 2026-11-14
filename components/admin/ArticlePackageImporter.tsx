"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  COPILOT_IMAGE_OUTPUT_STANDARD,
  QC_TOTE_VISUAL_STANDARD,
  type ArticleImagePlan,
  type ArticlePackage,
} from "@/lib/articlePackageContract";

type SelectedImages = Record<string, File | undefined>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addTableOfContents(html: string) {
  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  documentHtml.body
    .querySelectorAll('[data-article-toc="true"]')
    .forEach((element) => element.remove());

  const headings = Array.from(documentHtml.body.querySelectorAll("h2"));
  const usedIds = new Set<string>();

  headings.forEach((heading, index) => {
    const baseId = slugify(heading.textContent ?? "") || `section-${index + 1}`;
    let id = baseId;
    let suffix = 2;

    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

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
  if (!value || typeof value !== "object") {
    throw new Error("The selected file is not a valid article package.");
  }

  const article = value as Partial<ArticlePackage>;

  if (article.version != null && ![1, 2, 3].includes(article.version)) {
    throw new Error("This article package version is not supported.");
  }
  if (!article.title?.trim()) {
    throw new Error("The article package is missing a title.");
  }
  if (!article.contentHtml?.trim()) {
    throw new Error("The article package is missing article content.");
  }

  const imageIds = new Set<string>();
  for (const image of article.images ?? []) {
    if (!image.id?.trim()) {
      throw new Error("Every image recommendation must have an id.");
    }
    if (imageIds.has(image.id)) {
      throw new Error(`The image id "${image.id}" is duplicated.`);
    }
    if (image.kind !== "featured" && image.kind !== "body") {
      throw new Error(`The image recommendation "${image.id}" has an unsupported kind.`);
    }
    imageIds.add(image.id);
  }

  return article as ArticlePackage;
}

function fileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "img";
}

function renameImageForUpload(file: File, articleSlug: string, imageSlot: string) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const safeSlug = slugify(articleSlug) || "article";
  const safeSlot = slugify(imageSlot) || "image";
  const name = `${safeSlug}--${safeSlot}--${date}.${fileExtension(file)}`;
  return new File([file], name, { type: file.type, lastModified: file.lastModified });
}

async function uploadImage(file: File, articleSlug: string, imageSlot: string) {
  const renamedFile = renameImageForUpload(file, articleSlug, imageSlot);
  const formData = new FormData();
  formData.append("file", renamedFile);

  const response = await fetch("/api/admin/images", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result?.url) {
    throw new Error(result?.error || `The image "${renamedFile.name}" could not be uploaded.`);
  }

  return String(result.url);
}

function replaceBodyImageMarkers(
  html: string,
  imagePlans: ArticleImagePlan[],
  uploadedUrls: Record<string, string>,
) {
  const documentHtml = new DOMParser().parseFromString(html, "text/html");
  const bodyPlans = new Map(
    imagePlans
      .filter((image) => image.kind === "body")
      .map((image) => [image.id, image]),
  );

  const walker = documentHtml.createTreeWalker(
    documentHtml.body,
    NodeFilter.SHOW_COMMENT,
  );
  const comments: Comment[] = [];
  let current = walker.nextNode();

  while (current) {
    comments.push(current as Comment);
    current = walker.nextNode();
  }

  for (const comment of comments) {
    const match = /^\s*ARTICLE_IMAGE:([a-zA-Z0-9_-]+)\s*$/.exec(comment.data);
    if (!match) continue;

    const id = match[1];
    const plan = bodyPlans.get(id);
    const url = uploadedUrls[id];

    if (!plan || !url) {
      comment.remove();
      continue;
    }

    const image = documentHtml.createElement("img");
    const width = plan.width ?? 75;
    image.setAttribute("src", url);
    image.setAttribute("alt", plan.altText ?? "");
    image.setAttribute("loading", "lazy");
    image.setAttribute(
      "style",
      `display:block;width:${width}%;max-width:100%;height:auto;margin:1.5rem auto;`,
    );

    const paragraph = documentHtml.createElement("p");
    paragraph.append(image);
    comment.replaceWith(paragraph);
  }

  return documentHtml.body.innerHTML;
}

function buildCopilotImagePrompt(image: ArticleImagePlan) {
  const scenePrompt =
    image.generationPrompt?.trim() ||
    image.recommendation?.trim() ||
    "a polished image for this article";

  const parts = [`Generate an image of: ${scenePrompt}`];

  if (image.useQcToteVisualStandard || image.useQcToteReference) {
    parts.push(QC_TOTE_VISUAL_STANDARD);
  }

  parts.push(COPILOT_IMAGE_OUTPUT_STANDARD);
  return parts.join("\n\n");
}

function SelectedImage({
  file,
  alt,
  disabled,
  onReplace,
  onRemove,
}: {
  file: File;
  alt: string;
  disabled: boolean;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-lime-300 bg-white">
      <div className="bg-slate-100 p-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={alt}
            className="mx-auto max-h-[420px] w-full rounded-lg object-contain"
          />
        ) : (
          <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-slate-500">
            Preparing image preview...
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-bold text-lime-700">Selected image</p>
          <p className="truncate text-sm text-slate-600">{file.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReplace}
            disabled={disabled}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-lime-500 disabled:opacity-50"
          >
            Replace image
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-lg px-4 py-2 text-sm font-bold text-red-700 underline disabled:opacity-50"
          >
            Remove image
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticlePackageImporter({
  initialPackage = null,
  packageName,
}: {
  initialPackage?: ArticlePackage | null;
  packageName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const submitLockRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [articlePackage, setArticlePackage] = useState<ArticlePackage | null>(() =>
    initialPackage ? validatePackage(initialPackage) : null,
  );
  const [packageFileName, setPackageFileName] = useState(
    packageName ?? (initialPackage ? "Prepared from publishing calendar" : ""),
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImages>({});

  async function loadPackage(file: File) {
    setMessage("");
    setCopiedPromptId(null);

    try {
      const parsed = validatePackage(JSON.parse(await file.text()));
      setArticlePackage(parsed);
      setPackageFileName(file.name);
      setSelectedImages({});
    } catch (error) {
      setArticlePackage(null);
      setPackageFileName("");
      setSelectedImages({});
      setMessage(
        error instanceof Error
          ? error.message
          : "The article package could not be loaded.",
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function chooseImage(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImages((current) => ({ ...current, [id]: file }));
    event.target.value = "";
  }

  async function copyPrompt(image: ArticleImagePlan) {
    const prompt = buildCopilotImagePrompt(image);

    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPromptId(image.id);
      setMessage("Image prompt copied. Paste it into Copilot, download the winner, and upload it here.");
      window.setTimeout(() => {
        setCopiedPromptId((current) => (current === image.id ? null : current));
      }, 2500);
    } catch {
      setMessage("The prompt could not be copied automatically. Select the prompt text and copy it manually.");
    }
  }

  async function createDraft() {
    if (!articlePackage || submitLockRef.current) return;

    submitLockRef.current = true;
    setBusy(true);
    setMessage("Creating draft and uploading selected images...");

    try {
      for (const image of articlePackage.images ?? []) {
        if (image.required && !selectedImages[image.id]) {
          throw new Error(
            `Choose an image for "${image.recommendation}" before creating the draft.`,
          );
        }
      }

      const slug = slugify(articlePackage.slug?.trim() || articlePackage.title);
      if (!slug) {
        throw new Error("The article package could not create a valid slug.");
      }

      const uploadedUrls: Record<string, string> = {};
      for (const image of articlePackage.images ?? []) {
        const file = selectedImages[image.id];
        if (file) uploadedUrls[image.id] = await uploadImage(file, slug, image.id);
      }

      const featuredPlan = (articlePackage.images ?? []).find(
        (image) => image.kind === "featured",
      );
      const imageUrl = featuredPlan
        ? uploadedUrls[featuredPlan.id] ?? articlePackage.imageUrl ?? ""
        : articlePackage.imageUrl ?? "";

      let contentHtml = replaceBodyImageMarkers(
        articlePackage.contentHtml,
        articlePackage.images ?? [],
        uploadedUrls,
      );

      if (articlePackage.includeTableOfContents !== false) {
        contentHtml = addTableOfContents(contentHtml);
      }

      const response = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: articlePackage.title,
          slug,
          subtitle: articlePackage.subtitle ?? "",
          category: articlePackage.category ?? "Moving Tips",
          authorName:
            articlePackage.authorName ?? "QC Tote Rental Editorial Team",
          imageUrl,
          readTime: articlePackage.readTime ?? "",
          metaTitle: articlePackage.metaTitle ?? articlePackage.title,
          metaDescription:
            articlePackage.metaDescription ?? articlePackage.subtitle ?? "",
          contentHtml,
          publishedAt: null,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.externalId) {
        throw new Error(
          result?.error || "The article package could not be imported.",
        );
      }

      setMessage(
        result.existing
          ? "An article with this slug already exists. Opening the existing article..."
          : "Draft created. Opening the article editor...",
      );
      window.location.assign(
        `/admin/articles/${encodeURIComponent(result.externalId)}`,
      );
    } catch (error) {
      submitLockRef.current = false;
      setBusy(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "The article package could not be imported.",
      );
    }
  }

  const imagePlans = articlePackage?.images ?? [];

  return (
    <section className="mb-8 rounded-2xl border border-lime-300 bg-lime-50 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">
            {initialPackage ? "Prepared article package" : "Import article package"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Copy each ready-to-use prompt into Copilot, download the image you choose, upload the winner, and create a draft.
          </p>
        </div>
        <div className="shrink-0">
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadPackage(file);
            }}
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {articlePackage ? "Choose a different package" : "Choose article package"}
          </button>
        </div>
      </div>

      {articlePackage ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-lime-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-lime-700">
              Loaded package
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">
              {articlePackage.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{packageFileName}</p>
          </div>

          {imagePlans.length ? (
            <div>
              <h3 className="text-xl font-black text-slate-950">
                Images for this article
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                The copied prompt is self-contained and includes the QC Tote visual standard whenever the image calls for branded tote styling.
              </p>

              <div className="mt-4 grid gap-5">
                {imagePlans.map((image, index) => {
                  const selectedFile = selectedImages[image.id];
                  const finalPrompt = buildCopilotImagePrompt(image);
                  const location =
                    typeof image.location === "string"
                      ? image.location
                      : image.location?.afterHeading ??
                        image.location?.beforeHeading ??
                        "Planned article location";

                  return (
                    <div
                      key={image.id}
                      className="rounded-xl border border-slate-200 bg-white p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {index + 1}. {image.kind === "featured" ? "Featured image" : "Body image"}
                        {image.required ? " - Required" : " - Optional"}
                      </p>
                      <p className="mt-2 font-bold text-slate-950">
                        {image.recommendation}
                      </p>

                      {image.location ? (
                        <p className="mt-2 text-sm text-slate-600">
                          <strong>Location:</strong> {location}
                        </p>
                      ) : null}

                      {image.kind === "body" ? (
                        <p className="mt-1 text-sm text-slate-600">
                          <strong>Suggested width:</strong> {image.width ?? 75}%
                        </p>
                      ) : null}

                      {image.altText ? (
                        <p className="mt-1 text-sm text-slate-600">
                          <strong>Alt text:</strong> {image.altText}
                        </p>
                      ) : null}

                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-black text-slate-950">
                              Ready-to-use Copilot prompt
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Starts with “Generate an image of” so it works in a new Copilot session.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void copyPrompt(image)}
                            disabled={busy}
                            className="shrink-0 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                          >
                            {copiedPromptId === image.id ? "Copied" : "Copy prompt"}
                          </button>
                        </div>
                        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-6 text-slate-700">
                          {finalPrompt}
                        </pre>
                      </div>

                      <input
                        ref={(element) => {
                          imageInputsRef.current[image.id] = element;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(event) => chooseImage(image.id, event)}
                        disabled={busy}
                      />

                      {selectedFile ? (
                        <SelectedImage
                          file={selectedFile}
                          alt={image.altText ?? image.recommendation}
                          disabled={busy}
                          onReplace={() => imageInputsRef.current[image.id]?.click()}
                          onRemove={() =>
                            setSelectedImages((current) => ({
                              ...current,
                              [image.id]: undefined,
                            }))
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => imageInputsRef.current[image.id]?.click()}
                          disabled={busy}
                          className="mt-4 rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:border-lime-500 disabled:opacity-50"
                        >
                          Upload selected image
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void createDraft()}
              disabled={busy}
              className="rounded-lg bg-lime-400 px-6 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating draft..." : "Create draft"}
            </button>
            <button
              type="button"
              onClick={() => {
                setArticlePackage(null);
                setPackageFileName("");
                setSelectedImages({});
                setCopiedPromptId(null);
                setMessage("");
              }}
              disabled={busy}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
            >
              Cancel import
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="mt-4 text-sm font-semibold text-red-700">{message}</p>
      ) : null}
    </section>
  );
}
