"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PackageSummary = {
  version?: number;
  title?: string;
  slug?: string;
  metaTitle?: string;
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

type AuditResult = {
  linksValid: boolean;
  linkAudit: LinkAuditItem[];
};

type Props = {
  planSlug: string;
  planTitle: string;
  hasStoredPackage: boolean;
  hasSourcePackage: boolean;
  sourcePackageId?: string;
};

function statusLabel(item: LinkAuditItem) {
  if (item.valid && item.kind === "blog") return "Published / valid";
  if (item.valid) return "Valid";
  if (item.status === "draft") return "Draft / blocked";
  if (item.status === "scheduled") return "Scheduled / blocked";
  if (item.status === "not-found") return "Not found / blocked";
  return "Invalid / blocked";
}

export default function CalendarPackageActions({
  planSlug,
  planTitle,
  hasStoredPackage,
  hasSourcePackage,
  sourcePackageId,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const endpoint = `/api/admin/article-packages/${encodeURIComponent(planSlug)}`;
  const [storedAvailable, setStoredAvailable] = useState(hasStoredPackage);
  const [storedAudit, setStoredAudit] = useState<AuditResult | null>(null);
  const [candidate, setCandidate] = useState<PackageSummary | null>(null);
  const [candidateFileName, setCandidateFileName] = useState("");
  const [candidateAudit, setCandidateAudit] = useState<AuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!storedAvailable) {
      setStoredAudit(null);
      return;
    }

    let cancelled = false;

    async function auditStoredPackage() {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result?.error || "Could not audit the stored package.");
        if (!cancelled) {
          setStoredAudit({
            linksValid: result.linksValid === true,
            linkAudit: Array.isArray(result.linkAudit) ? result.linkAudit : [],
          });
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Could not audit the stored package.");
        }
      }
    }

    void auditStoredPackage();
    return () => {
      cancelled = true;
    };
  }, [endpoint, storedAvailable]);

  async function choosePackage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    setCandidateAudit(null);
    setAuditing(true);

    try {
      const parsed = JSON.parse(await file.text()) as PackageSummary;
      if (!parsed || typeof parsed !== "object") throw new Error("The selected file is not valid JSON.");
      if (!parsed.title?.trim()) throw new Error("The package is missing a title.");
      if (!parsed.contentHtml?.trim()) throw new Error("The package is missing article content.");
      if (parsed.slug && parsed.slug !== planSlug) {
        throw new Error(`Package slug must match the calendar slug "${planSlug}".`);
      }

      setCandidate(parsed);
      setCandidateFileName(file.name);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articlePackage: parsed, auditOnly: true }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The package links could not be audited.");

      setCandidateAudit({
        linksValid: result.linksValid === true,
        linkAudit: Array.isArray(result.linkAudit) ? result.linkAudit : [],
      });
    } catch (error) {
      setCandidate(null);
      setCandidateFileName("");
      setCandidateAudit(null);
      setMessage(error instanceof Error ? error.message : "The JSON package could not be loaded.");
    } finally {
      setAuditing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function savePackage() {
    if (!candidate || !candidateAudit?.linksValid) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ articlePackage: candidate }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "The prepared package could not be saved.");

      setStoredAvailable(true);
      setStoredAudit({
        linksValid: result.linksValid === true,
        linkAudit: Array.isArray(result.linkAudit) ? result.linkAudit : [],
      });
      setCandidate(null);
      setCandidateFileName("");
      setCandidateAudit(null);
      setMessage("Prepared package saved. You can now prepare the article.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The prepared package could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const preparePlan = storedAvailable ? planSlug : sourcePackageId;
  const canPrepare = Boolean(preparePlan) && (!storedAvailable || storedAudit?.linksValid !== false);
  const packageAvailable = storedAvailable || hasSourcePackage;

  return (
    <div className="w-full md:max-w-2xl">
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={choosePackage}
        disabled={auditing || saving}
      />

      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        {packageAvailable && preparePlan ? (
          <Link
            href={`/admin/articles/new?plan=${encodeURIComponent(preparePlan)}`}
            aria-disabled={!canPrepare}
            className={
              canPrepare
                ? "rounded-lg bg-lime-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-lime-300"
                : "pointer-events-none rounded-lg bg-slate-200 px-4 py-2 text-sm font-black text-slate-500"
            }
          >
            Prepare Article
          </Link>
        ) : null}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={auditing || saving}
          className={
            packageAvailable
              ? "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-lime-500 disabled:opacity-60"
              : "rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-lime-500 hover:text-slate-950 disabled:opacity-60"
          }
        >
          {auditing ? "Checking package..." : packageAvailable ? "Replace Package" : "Add Package"}
        </button>
      </div>

      {storedAvailable && storedAudit?.linksValid === false ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-left text-sm text-red-900">
          <p className="font-black">Package needs attention</p>
          <p className="mt-1">One or more links are not currently public. Review or replace the package before preparing the article.</p>
        </div>
      ) : null}

      {candidate ? (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
            {packageAvailable ? "Replacement package being reviewed" : "New package being reviewed"}
          </p>
          <p className="mt-2 font-black text-slate-950">{candidate.title}</p>
          <p className="mt-1 text-xs text-slate-500">{candidateFileName}</p>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <p className="font-black text-slate-950">Internal link audit</p>
            {candidateAudit ? (
              <>
                <p className={`mt-1 text-sm font-bold ${candidateAudit.linksValid ? "text-lime-700" : "text-red-700"}`}>
                  {candidateAudit.linksValid ? "All internal links are valid." : "Invalid links must be corrected before saving."}
                </p>
                {candidateAudit.linkAudit.length ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    {candidateAudit.linkAudit.map((item, index) => (
                      <li key={`${item.href}-${index}`} className="rounded-lg bg-slate-50 p-3">
                        <span className={item.valid ? "font-bold text-lime-700" : "font-bold text-red-700"}>
                          {statusLabel(item)}
                        </span>
                        <span className="ml-2 font-semibold text-slate-900">{item.text || item.href}</span>
                        <span className="block break-all text-slate-600">{item.href}</span>
                        {item.reason ? <span className="block text-slate-500">{item.reason}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">No links were found in the article content.</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Checking links...</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={savePackage}
              disabled={saving || auditing || !candidateAudit?.linksValid}
              className="rounded-lg bg-lime-400 px-4 py-2 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : packageAvailable ? "Replace Package" : "Save Package"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCandidate(null);
                setCandidateFileName("");
                setCandidateAudit(null);
                setMessage("");
              }}
              disabled={saving || auditing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-left text-sm font-semibold text-slate-700">{message}</p> : null}
    </div>
  );
}
