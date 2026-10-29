import type { MetadataRoute } from "next";
import { serviceAreas } from "@/config/serviceAreas";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qctoterentals.com";

  const corePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/service-area`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/reserve`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/agreement`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const cityPages: MetadataRoute.Sitemap = serviceAreas.map((area) => ({
    url: `${baseUrl}/${area.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...corePages, ...cityPages];
}
