import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getServiceAreaBySlug,
  serviceAreas,
} from "@/config/serviceAreas";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = getServiceAreaBySlug(slug);

  if (!area) {
    return {};
  }

  const title = `Moving Box & Tote Rental in ${area.city}, ${area.state} | QC Tote Rental`;
  const description = `Rent reusable plastic moving boxes and moving totes in ${area.city}, ${area.stateName}. QC Tote Rental delivers sturdy 27-gallon totes and picks them up after your move.`;
  const canonical = `https://qctoterentals.com/${area.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function ServiceAreaCityPage({ params }: PageProps) {
  const { slug } = await params;
  const area = getServiceAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="mb-3 block text-center font-semibold uppercase tracking-wide text-lime-400">
          {area.city}, {area.stateName}
        </p>

        <h1 className="block text-center text-4xl font-bold leading-tight md:text-5xl">
          Moving Box & Moving Tote Rental
          <span className="mt-2 block">
            in {area.city}, {area.state}
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-300">
          Moving in {area.city}? Skip buying, taping, and breaking down
          cardboard boxes. QC Tote Rental delivers durable, reusable 27-gallon
          moving totes to your door and picks them up when your move is complete.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/reserve"
            className="rounded-lg bg-lime-400 px-6 py-3 font-bold text-black transition hover:bg-lime-300"
          >
            Reserve Your Totes
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-lime-400 px-6 py-3 font-bold text-lime-400 transition hover:bg-lime-400 hover:text-black"
          >
            View Pricing
          </Link>
        </div>
      </section>

      <section className="bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center text-3xl font-bold">
            A Better Way to Move in {area.city}
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-black p-6">
              <h3 className="text-xl font-bold text-lime-400">No Cardboard</h3>
              <p className="mt-3 text-gray-300">
                No assembling boxes, buying tape, or dealing with piles of
                cardboard after your move.
              </p>
            </div>

            <div className="rounded-xl bg-black p-6">
              <h3 className="text-xl font-bold text-lime-400">Easy to Stack</h3>
              <p className="mt-3 text-gray-300">
                Our sturdy 27-gallon moving totes stack neatly and help keep
                your belongings organized throughout your move.
              </p>
            </div>

            <div className="rounded-xl bg-black p-6">
              <h3 className="text-xl font-bold text-lime-400">
                Delivered & Picked Up
              </h3>
              <p className="mt-3 text-gray-300">
                We bring your moving totes to you and pick them up when your
                rental period is complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-3xl font-bold">
          Reusable Moving Boxes for {area.city} Moves
        </h2>

        <p className="mt-5 text-lg leading-8 text-gray-300">
          {area.localIntro}
        </p>

        <p className="mt-5 text-lg leading-8 text-gray-300">
          {area.nearbyText} Our reusable plastic moving boxes are ready to pack
          as soon as they arrive.
        </p>

        <h2 className="mt-12 text-3xl font-bold">
          How Moving Tote Rental Works
        </h2>

        <div className="mt-7 space-y-5">
          <div>
            <h3 className="font-bold text-lime-400">
              1. Choose your tote package
            </h3>
            <p className="mt-1 text-gray-300">
              Select the package that fits the size of your move.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lime-400">2. We deliver</h3>
            <p className="mt-1 text-gray-300">
              Your reusable moving totes are delivered ready to pack.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lime-400">3. Pack and move</h3>
            <p className="mt-1 text-gray-300">
              Pack, stack, and move without assembling cardboard boxes.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lime-400">4. We pick them up</h3>
            <p className="mt-1 text-gray-300">
              When you are finished, we will arrange pickup of the totes.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-lime-400 text-black">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <h2 className="text-3xl font-bold">
            Planning a Move in {area.city}?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg">
            Make packing easier with reusable moving boxes delivered by QC Tote
            Rental.
          </p>
          <Link
            href="/reserve"
            className="mt-7 inline-block rounded-lg bg-black px-6 py-3 font-bold text-lime-400 transition hover:bg-zinc-800"
          >
            Reserve Moving Totes
          </Link>
        </div>
      </section>
    </main>
  );
}
