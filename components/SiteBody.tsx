import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { serializeJsonLd, structuredData } from "@/config/siteMetadata";

export default function SiteBody({ children }: { children: React.ReactNode }) {
  return (
    <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </body>
  );
}
