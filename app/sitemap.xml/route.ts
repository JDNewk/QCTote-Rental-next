import { siteUrl } from "@/config/siteMetadata";
import { getSitemapArticles } from "@/lib/articles";

const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/pricing", changefreq: "monthly", priority: "0.9" },
  { path: "/service-area", changefreq: "monthly", priority: "0.9" },
  { path: "/reserve", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  { path: "/agreement", changefreq: "monthly", priority: "0.5" },
];

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Generated from the articles table on every request.
export async function GET() {
  const articles = await getSitemapArticles();

  const urls = [
    ...staticPages.map(
      (page) =>
        `  <url>\n    <loc>${siteUrl}${page.path}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`
    ),
    ...articles.map(
      (article) =>
        `  <url>\n    <loc>${escapeXml(`${siteUrl}/blog/${encodeURIComponent(article.slug!)}`)}</loc>\n    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n  </url>`
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
