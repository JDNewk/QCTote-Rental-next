"use client";

import { useState } from "react";

type Props = {
  request: string;
};

export default function CopyPackageRequestButton({ request }: Props) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyRequest() {
    setError("");
    try {
      await navigator.clipboard.writeText(request);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy the request. Please try again.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copyRequest}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-lime-500"
      >
        {copied ? "Copied Package Request" : "Copy Package Request"}
      </button>
      {error ? <p className="mt-2 text-left text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
