"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

type PackageSummary = {
  version?: number;
  title?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentHtml?: string;
  images?: unknown[];
};

type LinkAuditItem = {
  href: string;
  text: string;
  kind: "site" | "blog" | "external" | "anchor";
  valid: boolean;
  status?: "published" | "draft" | "scheduled" | "not-found";
  reason?: string;
};

type AuditState = {
  linksValid: boolean;
  linkAudit: LinkAuditItem[];
};

type Props = {
  planSlug: string;
  planTitle: string;
};

function statusLabel(item: LinkAuditItem) {
  if (item.kind === "blog") {
    if (item.status === "published") return "Published / valid";
    if (item.status === "draft") return "Draft / blocked";
    if (item.status === "scheduled") return "Scheduled / blocked";
    if (item.status === "not-found") return "Not found / blocked";
  }
  return item.valid ? "Valid" : "Blocked";
}

function AuditPanel({ title, audit }: { title: string; audit: AuditState }) {
  const invalidCount = audit.linkAudit.filter((item) => !item.valid).length;

  return (
    <div className={`mt-4 rounded-xl border p-4 ${audit.linksValid ? "border-lime-200 bg-lime-50" : "border-red-200 bg-red-50"}`}>
      <h3 className="font-black text-slate-950">{title}</h3>
      <p className={`mt-2 text-sm font-bold ${audit.linksValid ? "text-lime-700" : "text-red-700"}`}>
        {audit.linksValid
          ? "All current internal links are valid."
          : `${invalidCount} internal link${invalidCount === 1 ? "" : "s"} require attention.`}
      </p>
      {audit.linkAudit.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {audit.linkAudit.map((item, index) => (
            <li key={`${item.href}-${index}`} className="rounded-lg bg-white/80 p-3">
              <span className={item.valid ? "font-bold text-lime-700" : "font-bold text-red-700"}>
                {statusLabel(item)}
              </span>{" "}
              <span className="font-semibold text-slate-900">{item.text || item.href}</span>
              <span className="block break-all text-slate-600">{item.href}</span>
              {item.reason ? <span className="block text-slate-500">{item.reason}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No links were found in the article content.</p>
      )}
    </div>
  );
}

export default function PreparedPackageUpload({ planSlug, planTitle }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<PackageSummary | null>(null);
  const [fileName, setFileName] = useState("");
  const [stored, setStored] = useState<PackageSummary | null>(null);
  const [storedAudit, setStoredAudit] = useState<AuditState | null>(null);
  const [candidateAudit, setCandidateAudit] = useState<AuditState | null>(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const endpoint = `/api/admin/article-packages/${encodeURIComponent(planSlug)}`;

  const refreshStored = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Could not read the stored package.");

      setStored(result?.articlePackage ?? null);
      setStoredAudit(
        result?.articlePackage
          ? {
              linksValid: result?.linksValid === true,
              linkAudit: Array.isArray(result?.linkAudit) ? result.linkAudit : [],
            }
          : null,
      );
    } catch (error) {
      setStored(null);
      setStoredAudit(null);
      setMessage(error instanceof Error ? error.message : "Could not read the stored package.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void refreshStored();
  }, [refreshStored]);

  async function auditCandidate(articlePackage: PackageSummary) {
    setAuditing(true);
    setCandidateAudit(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articlePackage, auditOnly: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The package links could not be audited.");

      const auditResult: AuditState = {
        linksValid: result?.linksValid === true,
        linkAudit: Array.isArray(result?.linkAudit) ? result.linkAudit : [],
      };
      setCandidateAudit(auditResult);
      return auditResult;
    } finally {
      setAuditing(false);
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setCandidateAudit(null);
    try {
      const parsed = JSON.parse(await file.text()) as PackageSummary;
      if (!parsed || typeof parsed !== "object") throw new Error("The selected file is not valid JSON.");
      if (!parsed.title?.trim()) throw new Error("The package is missing a title.");
      if (!parsed.contentHtml?.trim()) throw new Error("The package is missing article content.");

      setCandidate(parsed);
      setFileName(file.name);
      const auditResult = await auditCandidate(parsed);
      if (!auditResult.linksValid) {
        setMessage("The replacement package contains blocked internal links. Correct them before saving.");
      }
    } catch (error) {
      setCandidate(null);
      setFileName("");
      setCandidateAudit(null);
      setMessage(error instanceof Error ? error.message : "The JSON package could not be loaded.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function savePackage() {
    if (!candidate || !candidateAudit?.linksValid) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articlePackage: candidate }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (Array.isArray(result?.linkAudit)) {
          setCandidateAudit({
            linksValid: result?.linksValid === true,
            linkAudit: result.linkAudit,
          });
        }
        throw new Error(result?.error || "The prepared package could not be saved.");
      }

      setStored(result.articlePackage ?? candidate);
      setStoredAudit({
        linksValid: result?.linksValid === true,
        linkAudit: Array.isArray(result?.linkAudit) ? result.linkAudit : [],
      });
      setCandidate(null);
      setFileName("");
      setCandidateAudit(null);
      setMessage("Prepared package saved successfully.");
      await refreshStored();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The prepared package could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePackage() {
    if (!stored || !window.confirm(`Delete the stored package for "${planTitle}"?`)) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The prepared package could not be deleted.");
      setStored(null);
      setStoredAudit(null);
      setCandidate(null);
      setCandidateAudit(null);
      setFileName("");
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
          <p className="mt-2 text-slate-600">Checking stored package and current links...</p>
        ) : stored ? (
          <div className="mt-2">
            <p className={`font-semibold ${storedAudit?.linksValid ? "text-lime-700" : "text-red-700"}`}>
              {storedAudit?.linksValid ? "Package Ready" : "Package Needs Attention"}
            </p>
            <p className="mt-1 text-slate-700">{stored.title}</p>
            {stored.slug ? <p className="mt-1 text-sm text-slate-500">/{stored.slug}</p> : null}
            {storedAudit ? <AuditPanel title="Current package link status" audit={storedAudit} /> : null}
          </div>
        ) : (
          <p className="mt-2 text-slate-600">No package stored yet.</p>
        )}
      </div>

      <div className="mt-6">
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={chooseFile}
          disabled={busy || auditing}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || auditing}
          className="rounded-lg bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60"
        >
          {stored ? "Choose replacement JSON package" : "Choose JSON package"}
        </button>
      </div>

      {candidate ? (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Replacement package being reviewed</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{candidate.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{fileName}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p><strong>Slug:</strong> {candidate.slug || planSlug}</p>
            <p><strong>Version:</strong> {candidate.version ?? "unspecified"}</p>
            <p><strong>Images:</strong> {candidate.images?.length ?? 0}</p>
            <p><strong>SEO title:</strong> {candidate.metaTitle || "not provided"}</p>
          </div>

          {auditing ? (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-black text-slate-950">Replacement package link status</h3>
              <p className="mt-2 text-sm text-slate-600">Checking links against the current article database...</p>
            </div>
          ) : candidateAudit ? (
            <AuditPanel title="Replacement package link status" audit={candidateAudit} />
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={savePackage}
              disabled={busy || auditing || !candidateAudit?.linksValid}
              className="rounded-lg bg-lime-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving..." : stored ? "Replace stored package" : "Save package"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCandidate(null);
                setFileName("");
                setCandidateAudit(null);
                setMessage("");
              }}
              disabled={busy || auditing}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {stored ? (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={deletePackage}
            disabled={busy}
            className="rounded-lg bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            Delete stored package
          </button>
        </div>
      ) : null}

      {message ? <p className="mt-5 text-sm font-semibold text-slate-700">{message}</p> : null}
    </section>
  );
}
