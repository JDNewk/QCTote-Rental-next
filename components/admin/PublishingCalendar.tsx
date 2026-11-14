import Link from "next/link";
import { editorialCalendar } from "@/config/editorialCalendar";
import CalendarPackageActions from "@/components/admin/CalendarPackageActions";
import CopyPackageRequestButton from "@/components/admin/CopyPackageRequestButton";
import { buildArticlePackageRequest } from "@/lib/articlePackagePrompt";

type CalendarArticle = {
  externalId: string;
  slug: string | null;
  publishedAt: Date | null;
};

type PublishedArticleReference = {
  title: string;
  slug: string;
};

type PublishingCalendarProps = {
  articles: CalendarArticle[];
  storedPackageSlugs: string[];
  publishedArticles: PublishedArticleReference[];
};

function dateAtNoon(dateString: string) {
  return new Date(`${dateString}T12:00:00-06:00`);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(dateAtNoon(dateString));
}

function formatCentralDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(date);
}

export default function PublishingCalendar({
  articles,
  storedPackageSlugs,
  publishedArticles,
}: PublishingCalendarProps) {
  const articleBySlug = new Map(
    articles
      .filter((article) => article.slug)
      .map((article) => [article.slug as string, article]),
  );
  const storedPackageSet = new Set(storedPackageSlugs);
  const now = new Date();

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-lime-400">
          Publishing calendar
        </p>
        <h2 className="mt-1 text-2xl font-black">12-week article plan</h2>
        <p className="mt-2 text-sm text-slate-300">
          Copy a complete package request for Copilot, then add, validate, replace, and prepare article packages directly from the calendar.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {editorialCalendar.map((item) => {
          const article = articleBySlug.get(item.slug);
          const publishedAt = article?.publishedAt ?? null;
          const hasStoredPackage = storedPackageSet.has(item.slug);
          const hasSourcePackage = Boolean(item.packageId);
          const hasPreparedPackage = hasStoredPackage || hasSourcePackage;

          const state = article
            ? !publishedAt
              ? "Draft"
              : publishedAt > now
                ? "Scheduled"
                : "Published"
            : hasPreparedPackage
              ? "Package Ready"
              : "Planned";

          const badgeClass =
            state === "Published"
              ? "bg-lime-100 text-lime-800"
              : state === "Scheduled"
                ? "bg-blue-100 text-blue-800"
                : state === "Draft"
                  ? "bg-amber-100 text-amber-800"
                  : state === "Package Ready"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-slate-200 text-slate-700";

          const packageRequest = !article
            ? buildArticlePackageRequest({
                calendarItem: {
                  publishDate: item.publishDate,
                  title: item.title,
                  slug: item.slug,
                  intent: item.intent,
                },
                publishedArticles,
              })
            : null;

          return (
            <div
              key={item.slug}
              className="grid gap-4 px-6 py-5 md:grid-cols-[170px_1fr_minmax(280px,auto)] md:items-start"
            >
              <div>
                <p className="font-black text-slate-950">{formatDate(item.publishDate)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {item.intent}
                </p>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-950">{item.title}</p>
                {publishedAt ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {state === "Scheduled" ? "Scheduled for" : "Published"}{" "}
                    {formatCentralDateTime(publishedAt)}
                  </p>
                ) : article ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Draft exists in Article Editor
                  </p>
                ) : hasStoredPackage ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Prepared package stored in the database
                  </p>
                ) : hasSourcePackage ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Prepared source package available
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No prepared package stored yet
                  </p>
                )}
              </div>

              <div className="flex flex-col items-stretch gap-3 md:items-end">
                <span
                  className={`self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide md:self-end ${badgeClass}`}
                >
                  {state}
                </span>

                {article ? (
                  <Link
                    href={`/admin/articles/${encodeURIComponent(article.externalId)}`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-bold text-slate-800 hover:border-lime-500"
                  >
                    {state === "Scheduled" ? "Edit / Reschedule" : "Edit"}
                  </Link>
                ) : (
                  <div className="w-full space-y-3">
                    {packageRequest ? (
                      <div className="flex md:justify-end">
                        <CopyPackageRequestButton request={packageRequest} />
                      </div>
                    ) : null}
                    <CalendarPackageActions
                      planSlug={item.slug}
                      planTitle={item.title}
                      hasStoredPackage={hasStoredPackage}
                      hasSourcePackage={hasSourcePackage}
                      sourcePackageId={item.packageId}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
