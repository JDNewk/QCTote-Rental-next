import Link from "next/link";

export default function ServiceAreaPage() {
  const freeCities = [
    "Davenport, IA",
    "Bettendorf, IA",
    "Rock Island, IL",
    "Moline, IL",
    "East Moline, IL",
    "Silvis, IL",
    "Milan, IL",
    "Geneseo, IL",
    "Coal Valley, IL",
    "Colona, IL",
    "Port Byron, IL",
    "LeClaire, IA",
  ];

  const feeCities = [
    "Muscatine, IA",
    "Clinton, IA",
    "Eldridge, IA",
    "DeWitt, IA",
    "Orion, IL",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <p className="font-bold uppercase tracking-widest text-lime-400">
            Local Delivery & Pickup
          </p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Service Area
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            We serve the Illinois & Iowa Quad Cities and surrounding communities.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-lime-300 bg-white shadow-sm">
              <div className="bg-lime-400 px-7 py-5 text-slate-950">
                <p className="text-sm font-black uppercase tracking-widest">Free Zone</p>
                <h2 className="mt-1 text-2xl font-black">Free Delivery & Pickup</h2>
              </div>

              <div className="p-7 md:p-8">
                <p className="mb-6 leading-7 text-slate-600">
                  These communities are included in our free delivery and pickup area.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {freeCities.map((city) => (
                    <div
                      key={city}
                      className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-800"
                    >
                      <span className="mr-2 text-lime-600">●</span>
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-amber-300 bg-white shadow-sm">
              <div className="bg-amber-300 px-7 py-5 text-slate-950">
                <p className="text-sm font-black uppercase tracking-widest">Extended Zone</p>
                <h2 className="mt-1 text-2xl font-black">Delivery Fee Applies</h2>
              </div>

              <div className="p-7 md:p-8">
                <p className="mb-6 leading-7 text-slate-600">
                  We also serve these surrounding communities for a small delivery and pickup fee.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {feeCities.map((city) => (
                    <div
                      key={city}
                      className="rounded-xl bg-amber-50 px-4 py-3 font-semibold text-slate-800"
                    >
                      <span className="mr-2 text-amber-500">●</span>
                      {city}
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-bold text-slate-950">Extended-zone fee</p>
                  <p className="mt-2 leading-7 text-slate-700">
                    A $15 fee applies per leg (delivery or pickup) outside the free zone,
                    or $30 if both stops are outside it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl bg-slate-900 px-7 py-10 text-center text-white md:px-12">
            <p className="font-bold uppercase tracking-widest text-lime-400">
              Don't see your town?
            </p>
            <h2 className="mt-3 text-3xl font-black">Ask us about your location.</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
              We may still be able to deliver to your area. Contact us before reserving and we'll let you know.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl border border-slate-600 px-7 py-3.5 font-bold text-white transition hover:border-lime-400 hover:text-lime-400"
              >
                Contact Us
              </Link>
              <Link
                href="/reserve"
                className="rounded-xl bg-lime-400 px-7 py-3.5 font-black text-slate-950 transition hover:bg-lime-300"
              >
                Reserve Your Totes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
