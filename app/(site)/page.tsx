"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="bg-lime-400 px-4 py-3 text-center text-sm font-bold text-slate-950">
        ⚡ Limited totes available each week in the Quad Cities. Reserve early.
      </div>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-5 inline-flex rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-400">
            Moving Boxes & Tote Rental • Quad Cities & Surrounding Areas
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                WE DROP OFF.
                <br />
                <span className="text-lime-400">YOU PACK.</span>
                <br />
                WE PICK UP.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
                Moving in the Quad Cities or a nearby community? QC Tote Rental
                delivers sturdy 27-gallon plastic moving boxes and reusable
                totes right to your door in Davenport, Bettendorf, Moline, Rock
                Island, Geneseo, LeClaire and throughout our surrounding service
                area.
              </p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
                Pack on your schedule with no cardboard, no tape, and no piles
                of boxes to break down when the move is over.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/reserve"
                  className="rounded-lg bg-lime-400 px-8 py-4 text-center font-bold text-slate-950 transition hover:bg-lime-300"
                >
                  Reserve Your Totes
                </Link>
                <Link
                  href="/moving-boxes"
                  className="rounded-lg border border-slate-600 px-8 py-4 text-center font-bold text-white transition hover:border-lime-400 hover:text-lime-400"
                >
                  Explore Moving Box Rental
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-lime-400">
                A simpler way to move
              </p>
              <h2 className="mt-3 text-3xl font-bold">Skip the cardboard.</h2>
              <div className="mt-8 space-y-6">
                {[
                  "We deliver|Clean reusable totes delivered right to your door.",
                  "You pack and move|Pack at your own pace without buying and taping boxes.",
                  "We pick them up|When you're finished, we come back for the empty totes.",
                ].map((item, index) => {
                  const [title, text] = item.split("|");
                  return (
                    <div key={title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{title}</h3>
                        <p className="mt-1 text-slate-400">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-lime-600">
              Simple Moving
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Moving totes make packing simpler from start to finish.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              "We Deliver Your Totes|Select your package and preferred delivery date. We bring your clean, reusable totes directly to you.",
              "You Pack & Move|Pack your belongings in sturdy, stackable totes without worrying about cardboard boxes collapsing or tape coming loose.",
              "We Pick Them Up|Unpack at your new place and we'll collect the empty totes when your rental is complete.",
            ].map((item, index) => {
              const [title, text] = item.split("|");
              return (
                <div key={title} className="rounded-2xl bg-white p-8 shadow-sm">
                  <div className="text-5xl font-black text-lime-400">
                    0{index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="rounded-3xl bg-slate-50 p-6 md:p-10">
              <div className="relative mx-auto aspect-[4/3] max-w-xl overflow-hidden rounded-2xl bg-white shadow-sm">
                <Image
                  src="/qc-tote-product.png"
                  alt="Black 27 gallon moving tote with yellow lid"
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-lime-600">
                What You Get
              </p>
              <h2 className="mt-3 text-4xl font-black text-slate-950">
                Tough totes. Ready to move.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Our reusable moving totes are built to make packing, stacking,
                and moving simpler.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "27 gallon capacity",
                  '28" L × 20" W × 15" H',
                  "Holds up to 75 lbs",
                  "Durable & stackable",
                ].map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 font-semibold text-slate-800"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-400 text-sm font-black text-slate-950">
                      ✓
                    </span>
                    {spec}
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-lime-200 bg-lime-50 p-5 text-slate-800">
                <p className="font-bold">
                  No cardboard. No tape. No box assembly.
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Every package uses the same 27-gallon tote. Just choose how
                  many you need.
                </p>
              </div>
              <Link
                href="/reserve"
                className="mt-8 inline-block rounded-lg bg-lime-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-lime-300"
              >
                Reserve Your Totes
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-bold uppercase tracking-widest text-lime-600">
                Why reusable totes?
              </p>
              <h2 className="mt-3 text-4xl font-black text-slate-950">
                A Convenient Alternative to Cardboard
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Moving is stressful enough. Skip buying, taping, and breaking
                down cardboard moving boxes. Our reusable plastic moving boxes
                are sturdy, stackable, convenient, and ready to use when they
                arrive.
              </p>
              <div className="mt-7 flex flex-wrap gap-6">
                <Link
                  href="/moving-boxes"
                  className="font-bold text-slate-950 underline decoration-lime-400 decoration-4 underline-offset-4"
                >
                  Learn About Moving Box Rental
                </Link>
                <Link
                  href="/pricing"
                  className="font-bold text-slate-950 underline decoration-lime-400 decoration-4 underline-offset-4"
                >
                  View Packages & Pricing
                </Link>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                "♻️|Reusable|Reduce piles of disposable cardboard after your move.",
                "💪|Sturdy|Strong plastic totes help protect your belongings.",
                "📦|Stackable|Uniform totes stack neatly during packing and moving.",
                "🚚|Convenient|We deliver the totes and come back to collect them.",
              ].map((item) => {
                const [icon, title, text] = item.split("|");
                return (
                  <div key={title} className="rounded-2xl bg-white p-6">
                    <div className="text-3xl">{icon}</div>
                    <h3 className="mt-4 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-slate-600">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-bold uppercase tracking-widest text-lime-400">
            More Than Moving
          </p>
          <h2 className="mt-3 text-4xl font-black">
            Totes for Life's Big Projects
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              "Moving",
              "Decluttering",
              "Home Renovations",
              "Garage Projects",
              "College Moves",
              "Downsizing",
              "Home Staging",
              "Temporary Storage",
            ].map((use) => (
              <div
                key={use}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-6 font-semibold"
              >
                {use}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-bold uppercase tracking-widest text-lime-600">
            Local Service
          </p>
          <h2 className="mt-3 text-4xl font-black text-slate-950">
            Serving the Quad Cities & Surrounding Areas
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Looking for moving boxes or moving supplies near the Quad Cities? We
            deliver reusable moving totes across the Illinois and Iowa Quad
            Cities plus surrounding communities.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/moving-boxes"
              className="font-bold text-slate-950 underline decoration-lime-400 decoration-4 underline-offset-4"
            >
              Explore Moving Box Rental
            </Link>
            <Link
              href="/service-area"
              className="font-bold text-slate-950 underline decoration-lime-400 decoration-4 underline-offset-4"
            >
              View Our Service Area
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {[
              "Davenport",
              "Bettendorf",
              "Rock Island",
              "Moline",
              "East Moline",
              "Silvis",
              "Milan",
              "Geneseo",
            ].map((city) => (
              <span
                key={city}
                className="rounded-full bg-slate-100 px-5 py-3 font-semibold text-slate-800"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-lime-400 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center text-slate-950">
          <h2 className="text-4xl font-black sm:text-5xl">
            Ready to Make Moving Easier?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium">
            Skip the cardboard box hunt. Reserve reusable moving totes and we'll
            bring them directly to you.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/reserve"
              className="rounded-lg bg-slate-950 px-8 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              Reserve Your Totes
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border-2 border-slate-950 px-8 py-4 font-bold text-slate-950 transition hover:bg-lime-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
