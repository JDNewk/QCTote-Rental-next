import { siteConfig } from "../config/siteConfig";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-8 mt-20">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-700 text-sm">

        <p className="text-center md:text-left">
          © 2026 QC Tote Rental — Quad Cities, IL & IA
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-gray-700 font-medium">
          <a href={siteConfig.phoneHref} className="hover:text-blue-600">
            📞 {siteConfig.phone}
          </a>
          <a href={siteConfig.emailHref} className="hover:text-blue-600">
            ✉️ {siteConfig.email}
          </a>
        </div>

      </div>
    </footer>
  );
}
