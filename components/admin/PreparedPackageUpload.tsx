"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

type PackageSummary = {
  version?: number;
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml?: string;
  images?: unknown[];
};

type Props = {
  planSlug: string;
  planTitle: string;
};

export default function PreparedPackageUpload({ planSlug, planTitle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<PackageSummary | null>(null);
  const [fileName, setFileName] = useState("");
  const [stored, setStored] = useState<PackageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const endpoint = `/api/admin/article-packages/${encodeURIComponent(planSlug)}`;

  async function refreshStored() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Could not read the stored package.");
      setStored(result?.articlePackage ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read the stored package.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStored();
    // endpoint changes only when this page changes to another plan.
  }, [endpoint]);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    try {
      const parsed = JSON.parse(await file.text()) as PackageSummary;
      if (!parsed || typeof parsed !== "object") throw new Error("The selected file is not valid JSON.");
      if (!parsed.title?.trim()) throw new Error("The package is missing a title.");
      if (!parsed.contentHtml?.trim()) throw new Error("The package is missing article content.");
      setCandidate(parsed);
      setFileName(file.name);
    } catch (error) {
      setCandidate(null);
      setFileName("");
      setMessage(error instanceof Error ? error.message : "The JSON package could not be loaded.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function savePackage() {
    if (!candidate) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articlePackage: candidate }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The prepared package could not be saved.");
      setStored(result.articlePackage ?? candidate);
      setCandidate(null);
      setFileName("");
      setMessage("Prepared package saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The prepared package could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePackage() {
    if (!stored || !window.confirm(`Delete the stored package for \"${planTitle}\"?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The prepared package could not be deleted.");
      setStored(null);
      setMessage("Stored prepared package deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The prepared package could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-widest text-lime-600">Prepared article package</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">{planTitle}</h1>
      <p className="mt-2 text-sm text-slate-500">Calendar slug: {planSlug}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-bold text-slate-950">Storage status</p>
        {loading ? (
          <p className="mt-2 text-slate-600">Checking stored package...</p>
        ) : stored ? (
          <div className="mt-2">
            <p className="font-semibold text-lime-700">Package Ready</p>
            <p className="mt-1 text-slate-700">{stored.title}</p>
            {stored.slug ? <p className="mt-1 text-sm text-slate-500">/{stored.slug}</p> : null}
          </div>
        ) : (
          <p className="mt-2 text-slate-600">No package stored yet.</p>
        )}
      </div>

      <div className="mt-6">
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={chooseFile} disabled={busy} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">
          {stored ? "Choose replacement JSON package" : "Choose JSON package"}
        </button>
      </div>

      {candidate ? (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Ready to save</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{candidate.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{fileName}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p><strong>Slug:</strong> {candidate.slug || planSlug}</p>
            <p><strong>Version:</strong> {candidate.version ?? "unspecified"}</p>
            <p><strong>Images:</strong> {candidate.images?.length ?? 0}</p>
            <p><strong>SEO title:</strong> {candidate.metaTitle || "not provided"}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={savePackage} disabled={busy} className="rounded-lg bg-lime-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60">
              {busy ? "Saving..." : stored ? "Replace stored package" : "Save package"}
            </button>
            <button type="button" onClick={() => { setCandidate(null); setFileName(""); }} disabled={busy} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {stored ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <button type="button" onClick={deletePackage} disabled={busy} className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-60">
            Delete stored package
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-5 text-sm font-semibold text-slate-700">{message}</p> : null}
    </section>
  );
}
