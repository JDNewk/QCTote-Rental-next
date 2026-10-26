import type { Metadata } from "next";

export const siteUrl = "https://qctoterentals.com";

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
    siteName: "QC Tote Rental",
    type: "website",
  },
};

export const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "QC Tote Rental",
  url: siteUrl,
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

// Escapes "<" so JSON can't close the surrounding <script> tag.
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
