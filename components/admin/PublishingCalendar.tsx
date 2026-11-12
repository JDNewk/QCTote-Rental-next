import Link from "next/link";
import { editorialCalendar } from "@/config/editorialCalendar";

type CalendarArticle = {
  externalId: string;
  slug: string | null;
  publishedAt: Date | null;
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

export default function PublishingCalendar({ articles }: { articles: CalendarArticle[] }) {
  const articleBySlug = new Map(
    articles.filter((article) => article.slug).map((article) => [article.slug as string, article]),
  );
  const now = new Date();

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-lime-400">Publishing calendar</p>
        <h2 className="mt-1 text-2xl font-black">12-week article plan</h2>
        <p className="mt-2 text-sm text-slate-300">Prepared packages open directly from the calendar. Other planned topics continue to open the manual New Article page.</p>
      </div>

      <div className="divide-y divide-slate-200">
        {editorialCalendar.map((item) => {
          const article = articleBySlug.get(item.slug);
          const publishedAt = article?.publishedAt ?? null;
          const state = !article
            ? "Planned"
            : !publishedAt
              ? "Draft"
              : publishedAt > now
                ? "Scheduled"
                : "Published";

          const badgeClass =
            state === "Published"
              ? "bg-lime-100 text-lime-800"
              : state === "Scheduled"
                ? "bg-blue-100 text-blue-800"
                : state === "Draft"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-700";

          const createHref = item.packageId
            ? `/admin/articles/new?plan=${encodeURIComponent(item.packageId)}`
            : "/admin/articles/new";

          return (
            <div key={item.slug} className="grid gap-4 px-6 py-5 md:grid-cols-[170px_1fr_auto] md:items-center">
              <div>
                <p className="font-black text-slate-950">{formatDate(item.publishDate)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{item.intent}</p>
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-950">{item.title}</p>
                {publishedAt ? (
                  <p className="mt-1 text-sm text-slate-500">
                    {state === "Scheduled" ? "Scheduled for" : "Published"} {formatCentralDateTime(publishedAt)}
                  </p>
                ) : article ? (
                  <p className="mt-1 text-sm text-slate-500">Draft exists in Article Editor</p>
                ) : item.packageId ? (
                  <p className="mt-1 text-sm font-semibold text-lime-700">Prepared article package available</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Not created yet</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClass}`}>
                  {state}
                </span>
                {article ? (
                  <Link href={`/admin/articles/${encodeURIComponent(article.externalId)}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-lime-500">
                    {state === "Scheduled" ? "Edit / Reschedule" : "Edit"}
                  </Link>
                ) : (
                  <Link href={createHref} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-lime-500 hover:text-slate-950">
                    {item.packageId ? "Prepare Article" : "Create"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
