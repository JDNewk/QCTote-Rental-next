import { editorialCalendar } from "@/config/editorialCalendar";
import { isAdmin, isSameOrigin } from "@/lib/adminAuth";
import {
  deleteStoredPreparedArticlePackage,
  getStoredPreparedArticlePackage,
  saveStoredPreparedArticlePackage,
  validatePreparedArticlePackage,
} from "@/lib/preparedArticlePackageStore";

type RouteContext = {
  params: Promise<{ plan: string }>;
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

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdmin())) return json({ error: "Unauthorized." }, 401);

  const { calendarItem, planSlug } = await getCalendarItem(context);
  if (!calendarItem) return json({ error: "Publishing-calendar item not found." }, 404);

  try {
    const articlePackage = await getStoredPreparedArticlePackage(planSlug);
    return json({
      ok: true,
      plan: calendarItem,
      exists: Boolean(articlePackage),
      articlePackage,
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

    const saved = await saveStoredPreparedArticlePackage(planSlug, {
      ...articlePackage,
      slug: calendarItem.slug,
    });

    return json({ ok: true, plan: calendarItem, articlePackage: saved });
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
