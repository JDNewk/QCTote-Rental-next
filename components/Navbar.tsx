"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight text-white transition hover:text-lime-400" onClick={close}>QC <span className="text-lime-400">Tote Rental</span></Link>
        <button type="button" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 text-2xl text-white transition hover:border-lime-400 hover:text-lime-400 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation menu" aria-expanded={open}>{open ? "×" : "☰"}</button>
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/moving-boxes" className="text-slate-200 transition hover:text-lime-400">Moving Boxes</Link>
          <Link href="/pricing" className="text-slate-200 transition hover:text-lime-400">Pricing</Link>
          <Link href="/service-area" className="text-slate-200 transition hover:text-lime-400">Service Area</Link>
          <Link href="/agreement" className="text-slate-200 transition hover:text-lime-400">Agreement</Link>
          <Link href="/blog" className="text-slate-200 transition hover:text-lime-400">Blog</Link>
          <Link href="/contact" className="text-slate-200 transition hover:text-lime-400">Contact</Link>
          <Link href="/reserve" className="rounded-lg bg-lime-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-lime-300">Reserve Totes</Link>
        </div>
      </div>
      {open && <div className="border-t border-slate-800 bg-slate-950 px-6 pb-6 pt-4 md:hidden"><div className="mx-auto flex max-w-6xl flex-col gap-2 font-semibold">
        {[['/moving-boxes','Moving Boxes'],['/pricing','Pricing'],['/service-area','Service Area'],['/agreement','Agreement'],['/blog','Blog'],['/contact','Contact']].map(([href,label])=><Link key={href} href={href} onClick={close} className="rounded-lg px-3 py-3 text-slate-200 transition hover:bg-slate-900 hover:text-lime-400">{label}</Link>)}
        <Link href="/reserve" onClick={close} className="mt-2 rounded-lg bg-lime-400 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-lime-300">Reserve Totes</Link>
      </div></div>}
    </nav>
  );
}
