"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          QC Tote Rental
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link href="/pricing" className="hover:text-blue-600">Pricing</Link>
          <Link href="/service-area" className="hover:text-blue-600">Service Area</Link>
          <Link href="/reserve" className="hover:text-blue-600">Reserve</Link>
          <Link href="/agreement" className="hover:text-blue-600">Agreement</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact</Link>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4 text-gray-700 font-medium">
          <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/service-area" onClick={()=>setOpen(false)}>Service Area</Link>
          <Link href="/reserve" onClick={() => setOpen(false)}>Reserve</Link>
          <Link href="/agreement" onClick={() => setOpen(false)}>Agreement</Link>
          <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      )}
    </nav>
  );
}
