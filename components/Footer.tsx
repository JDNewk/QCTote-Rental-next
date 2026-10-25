import Link from "next/link";
import { siteConfig } from "../config/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 md:items-start">
          <div>
            <Link href="/" className="text-2xl font-black text-white">
              QC Tote <span className="text-lime-400">Rental</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Durable, reusable moving totes delivered to your door throughout
              the Illinois and Iowa Quad Cities.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white">Quick Links</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link href="/pricing" className="hover:text-lime-400 transition">Pricing</Link>
              <Link href="/service-area" className="hover:text-lime-400 transition">Service Area</Link>
              <Link href="/reserve" className="hover:text-lime-400 transition">Reserve Totes</Link>
              <Link href="/agreement" className="hover:text-lime-400 transition">Rental Agreement</Link>
              <Link href="/contact" className="hover:text-lime-400 transition">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white">Contact</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a href={siteConfig.phoneHref} className="hover:text-lime-400 transition">
                📞 {siteConfig.phone}
              </a>
              <a href="mailto:info@qctoterentals.com" className="hover:text-lime-400 transition">
                ✉️ info@qctoterentals.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500 md:text-left">
          © 2026 QC Tote Rental — Quad Cities, IL & IA
        </div>
      </div>
    </footer>
  );
}
