import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import SiteBody from "@/components/SiteBody";

export const metadata: Metadata = {
  title: "Page Not Found | QC Tote Rental",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <SiteBody>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-bold uppercase tracking-widest text-lime-600">404</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">Page Not Found</h1>
          <p className="mt-5 text-lg text-slate-600">The page you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-8 inline-block rounded-lg bg-slate-950 px-7 py-3 font-bold text-white">Back to home</Link>
        </div>
      </SiteBody>
    </html>
  );
}
