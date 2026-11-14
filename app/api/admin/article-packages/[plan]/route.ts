import { editorialCalendar } from "@/config/editorialCalendar";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";
import {
  deleteStoredPreparedArticlePackage,
  getStoredPreparedArticlePackage,
  saveStoredPreparedArticlePackage,
  validatePreparedArticlePackage,
} from "@/lib/preparedArticlePackageStore";

const APPROVED_SITE_ROUTES = new Set([
  "/",
  "/moving-boxes",
  "/pricing",
  "/service-area",
  "/reserve",
]);

type RouteContext = {
  params: Promise<{ plan: string }>;
};

type LinkArticleRow = {
  slug: string | null;
  publishedAt: Date | null;
};

type BlogLinkStatus = "published" | "draft" | "scheduled" | "not-found";

type LinkAuditItem = {
  href: string;
  text: string;
  kind: "site" | "blog" | "external" | "anchor";
  valid: boolean;
  status?: BlogLinkStatus;
  reason?: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

async function getCalendarItem(context: RouteContext) {
  const { plan } = await context.params;
  const planSlug = decodeURIComponent(plan);
  const calendarItem = editorialCalendar.find((item) => item.slug === planSlug);
  return { calendarItem, planSlug };
}

function extractLinks(html: string) {
  const links: Array<{ href: string; text: string }> = [];
  const anchorRegex = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    links.push({
      href: match[1].trim(),
      text: match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    });
  }

  return links;
}

async function auditLinks(contentHtml: string): Promise<LinkAuditItem[]> {
  const prisma = getPrisma();
  const articleRows: LinkArticleRow[] = await prisma.article.findMany({
    where: { slug: { not: null } },
    select: { slug: true, publishedAt: true },
  });

  const articlesBySlug = new Map<string, { publishedAt: Date | null }>();
  for (const article of articleRows) {
    if (article.slug) {
      articlesBySlug.set(article.slug, { publishedAt: article.publishedAt });
    }
  }

  const now = new Date();

  return extractLinks(contentHtml).map(({ href, text }) => {
    if (href.startsWith("#")) {
      return { href, text, kind: "anchor", valid: true };
    }

    if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
      return { href, text, kind: "external", valid: true };
    }

    if (href.startsWith("/blog/")) {
      const rawSlug = href.slice("/blog/".length).split(/[?#]/, 1)[0];
      let slug = rawSlug;
      try {
        slug = decodeURIComponent(rawSlug);
      } catch {
        // Keep the raw slug if decoding fails; it will be rejected below.
      }

      const article = articlesBySlug.get(slug);
      if (!article) {
        return {
          href,
          text,
          kind: "blog",
          valid: false,
          status: "not-found",
          reason: `No article with slug "${slug}" exists in Prisma.`,
        };
      }

      if (!article.publishedAt) {
        return {
          href,
          text,
          kind: "blog",
          valid: false,
          status: "draft",
          reason: `The article with slug "${slug}" exists, but it is still a draft and is not publicly available.`,
        };
      }

      if (article.publishedAt > now) {
        return {
          href,
          text,
          kind: "blog",
          valid: false,
          status: "scheduled",
          reason: `The article with slug "${slug}" is scheduled for the future and is not publicly available yet.`,
        };
      }

      return {
        href,
        text,
        kind: "blog",
        valid: true,
        status: "published",
      };
    }

    if (href.startsWith("/")) {
      const path = href.split(/[?#]/, 1)[0];
      const valid = APPROVED_SITE_ROUTES.has(path);
      return {
        href,
        text,
        kind: "site",
        valid,
        reason: valid ? undefined : `"${path}" is not an approved fixed site route.`,
      };
    }

    return {
      href,
      text,
      kind: "external",
      valid: false,
      reason: "Relative links must begin with /, #, https://, mailto:, or tel:.",
    };
  });
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdmin())) return json({ error: "Unauthorized." }, 401);

  const { calendarItem, planSlug } = await getCalendarItem(context);
  if (!calendarItem) return json({ error: "Publishing-calendar item not found." }, 404);

  try {
    const articlePackage = await getStoredPreparedArticlePackage(planSlug);
    const linkAudit = articlePackage?.contentHtml
      ? await auditLinks(articlePackage.contentHtml)
      : [];

    return json({
      ok: true,
      plan: calendarItem,
      exists: Boolean(articlePackage),
      articlePackage,
      linkAudit,
      linksValid: linkAudit.every((item) => item.valid),
    });
  } catch (error) {
    console.error("Prepared package read error:", error);
    return json({ error: "The prepared article package could not be read." }, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdmin())) return json({ error: "Unauthorized." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Invalid origin." }, 403);

  const { calendarItem, planSlug } = await getCalendarItem(context);
  if (!calendarItem) return json({ error: "Publishing-calendar item not found." }, 404);

  try {
    const body = await request.json();
    const articlePackage = validatePreparedArticlePackage(body?.articlePackage ?? body);

    if (articlePackage.slug && articlePackage.slug !== calendarItem.slug) {
      return json(
        { error: `Package slug must match the calendar slug "${calendarItem.slug}".` },
        400,
      );
    }

    const normalizedPackage = {
      ...articlePackage,
      slug: calendarItem.slug,
    };

    const linkAudit = await auditLinks(normalizedPackage.contentHtml);
    const invalidLinks = linkAudit.filter((item) => !item.valid);

    if (body?.auditOnly === true) {
      return json({
        ok: invalidLinks.length === 0,
        plan: calendarItem,
        linkAudit,
        linksValid: invalidLinks.length === 0,
      });
    }

    if (invalidLinks.length > 0) {
      return json(
        {
          error: "The prepared package contains internal links that are not publicly available.",
          linkAudit,
          linksValid: false,
        },
        400,
      );
    }

    const saved = await saveStoredPreparedArticlePackage(planSlug, normalizedPackage);

    return json({
      ok: true,
      plan: calendarItem,
      articlePackage: saved,
      linkAudit,
      linksValid: true,
    });
  } catch (error) {
    console.error("Prepared package save error:", error);
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The article package could not be saved.",
      },
      400,
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdmin())) return json({ error: "Unauthorized." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Invalid origin." }, 403);

  const { calendarItem, planSlug } = await getCalendarItem(context);
  if (!calendarItem) return json({ error: "Publishing-calendar item not found." }, 404);

  try {
    await deleteStoredPreparedArticlePackage(planSlug);
    return json({ ok: true, deleted: true, plan: calendarItem });
  } catch (error) {
    console.error("Prepared package delete error:", error);
    return json({ error: "The prepared article package could not be deleted." }, 500);
  }
}
