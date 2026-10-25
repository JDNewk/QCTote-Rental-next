import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://qctoterentals.com"),
  title: {
    default: "Moving Boxes & Moving Tote Rental | Quad Cities & Surrounding Areas",
    template: "%s | QC Tote Rental",
  },
  description:
    "Moving in the Quad Cities or surrounding areas? Rent durable 27-gallon plastic moving boxes and totes delivered to your door. We deliver, you pack, and we pick up.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Moving Boxes & Moving Tote Rental | Quad Cities & Surrounding Areas",
    description:
      "Moving box and reusable tote rental delivered throughout the Quad Cities and surrounding communities in Illinois and Iowa.",
    url: "https://qctoterentals.com",
    siteName: "QC Tote Rental",
    type: "website",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "QC Tote Rental",
  url: "https://qctoterentals.com",
  telephone: "+1-309-489-3025",
  description:
    "Moving box and reusable plastic moving tote rental serving the Quad Cities and surrounding communities in Illinois and Iowa.",
  areaServed: [
    "Davenport, IA", "Bettendorf, IA", "Rock Island, IL", "Moline, IL",
    "East Moline, IL", "Silvis, IL", "Milan, IL", "Geneseo, IL",
    "Coal Valley, IL", "Colona, IL", "Port Byron, IL", "LeClaire, IA",
    "Muscatine, IA", "Clinton, IA", "Eldridge, IA", "DeWitt, IA", "Orion, IL"
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
