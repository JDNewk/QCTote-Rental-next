"use client";

import { ChangeEvent, useRef, useState } from "react";

type FeaturedImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export default function FeaturedImageUpload({ value, onChange }: FeaturedImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Image upload failed.");
      }

      if (!result?.url) {
        throw new Error("The upload completed but no image URL was returned.");
      }

      onChange(String(result.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-slate-950 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "Uploading..." : value ? "Replace featured image" : "Upload featured image"}
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 disabled:opacity-60"
          >
            Remove image
          </button>
        ) : null}
      </div>

      <p className="text-sm text-slate-500">JPG, PNG, WebP, or GIF. Maximum upload size: 8 MB.</p>

      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Featured image preview" className="max-h-80 w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
