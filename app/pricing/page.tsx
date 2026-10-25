export default function PricingPage() {
  const packages = [
    { totes: 20, price: 99 },
    { totes: 40, price: 169, popular: true },
    { totes: 60, price: 219 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-4 text-center text-4xl font-bold">Pricing</h1>
      <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600">
        Choose the number of totes you need. Every package includes a 2-week rental.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {packages.map((pkg) => (
          <div
            key={pkg.totes}
            className={`relative rounded-xl bg-white p-6 text-center shadow-sm ${
              "popular" in pkg && pkg.popular
                ? "border-2 border-blue-600 ring-2 ring-blue-100"
                : "border"
            }`}
          >
            {"popular" in pkg && pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white shadow-sm">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-semibold">{pkg.totes} Totes</h2>
            <p className="my-4 text-4xl font-bold text-blue-600">${pkg.price}</p>
            <p className="mb-6 text-gray-600">2-week rental</p>
            <a
              href="/reserve"
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Reserve Your Totes
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
