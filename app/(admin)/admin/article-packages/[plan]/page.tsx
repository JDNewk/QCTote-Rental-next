import Link from "next/link";
import { notFound } from "next/navigation";
import PreparedPackageUpload from "@/components/admin/PreparedPackageUpload";
import { editorialCalendar } from "@/config/editorialCalendar";
import { requireAdmin } from "@/lib/adminAuth";

export const instant = false;

type PageProps = {
  params: Promise<{ plan: string }>;
};

export default async function PreparedPackagePage({ params }: PageProps) {
  await requireAdmin();
  const { plan } = await params;
  const planSlug = decodeURIComponent(plan);
  const calendarItem = editorialCalendar.find((item) => item.slug === planSlug);
  if (!calendarItem) notFound();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="font-bold text-slate-700 hover:text-lime-600">
          Back to all articles
        </Link>
        <div className="mt-6">
          <PreparedPackageUpload planSlug={calendarItem.slug} planTitle={calendarItem.title} />
        </div>
      </div>
    </main>
  );
}
