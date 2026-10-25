import Link from "next/link";

export default function PricingPage() {
  const packages = [
    { totes: 20, price: 99 },
    { totes: 40, price: 169, popular: true },
    { totes: 60, price: 219 },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-slate-950 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="font-bold uppercase tracking-widest text-lime-400">
            Simple, Upfront Pricing
          </p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Choose the Tote Package That Fits Your Move
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Every package includes a 2-week rental. Choose the number of totes
            you need and reserve your preferred dates.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {packages.map((pkg) => {
              const isPopular = "popular" in pkg && pkg.popular;

              return (
                <div
                  key={pkg.totes}
                  className={`relative flex flex-col rounded-3xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    isPopular
                      ? "border-2 border-lime-400 ring-4 ring-lime-100"
                      : "border border-slate-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-5 py-2 text-sm font-black uppercase tracking-wide text-slate-950 shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    Moving Tote Package
                  </p>

                  <h2 className="mt-3 text-3xl font-black text-slate-950">
                    {pkg.totes} Totes
                  </h2>

                  <p className="mt-6 text-5xl font-black text-lime-600">
                    ${pkg.price}
                  </p>

                  <p className="mt-2 font-semibold text-slate-500">
                    2-week rental
                  </p>

                  <div className="my-7 border-t border-slate-200" />

                  <ul className="mb-8 space-y-3 text-left text-slate-600">
                    <li className="flex gap-3">
                      <span className="font-bold text-lime-600">✓</span>
                      <span>{pkg.totes} reusable moving totes</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-lime-600">✓</span>
                      <span>Sturdy and stackable</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-lime-600">✓</span>
                      <span>No cardboard or tape required</span>
                    </li>
                  </ul>

                  <Link
                    href="/reserve"
                    className={`mt-auto inline-block rounded-xl px-6 py-4 font-black transition ${
                      isPopular
                        ? "bg-lime-400 text-slate-950 hover:bg-lime-300"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    Reserve Your Totes
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-3xl bg-slate-900 px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-3xl font-black">Not sure how many totes you need?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
              Choose the package that best matches your move. If you have questions,
              contact QC Tote Rental before reserving.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl border border-slate-600 px-7 py-3 font-bold text-white transition hover:border-lime-400 hover:text-lime-400"
              >
                Contact Us
              </Link>
              <Link
                href="/reserve"
                className="rounded-xl bg-lime-400 px-7 py-3 font-black text-slate-950 transition hover:bg-lime-300"
              >
                Reserve Totes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
