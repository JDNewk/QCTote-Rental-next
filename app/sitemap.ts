import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qctoterentals.com";
  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/service-area`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/reserve`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/agreement`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
