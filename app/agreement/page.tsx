export default function AgreementPage() {
  const sections = [
    {
      title: "Equipment Responsibility",
      content: (
        <p>
          You are responsible for all rented totes and equipment from delivery until pickup is completed. All items must be returned in the same condition as delivered, normal wear and tear excepted.
        </p>
      ),
    },
    {
      title: "Damage or Loss",
      content: (
        <>
          <p className="mb-3">Replacement costs:</p>
          <ul className="mb-3 list-disc space-y-1 pl-6">
            <li>Tote (bin + lid): $10 each</li>
            <li>Tote Dolly: $40</li>
          </ul>
          <p>Any damaged or missing items will be charged to the card used at checkout.</p>
        </>
      ),
    },
    {
      title: "Late Returns",
      content: (
        <>
          <p className="mb-3">If items are not ready for pickup on the scheduled date, additional charges may apply:</p>
          <ul className="mb-3 list-disc space-y-1 pl-6">
            <li>20 totes: $40 per extra week</li>
            <li>40 totes: $70 per extra week</li>
            <li>60 totes: $100 per extra week</li>
            <li>Tote Dolly: $40 per extra week for standalone rental or $20 per extra week with a tote package add-on.</li>
          </ul>
          <p>If you need more time, just let us know.</p>
        </>
      ),
    },
    {
      title: "Pickup Access",
      content: (
        <p>All totes must be empty, accessible, and ready for pickup. If not accessible, additional fees may apply.</p>
      ),
    },
    {
      title: "Proper Use",
      content: (
        <>
          <p className="mb-3">Totes may NOT be used for:</p>
          <ul className="mb-3 list-disc space-y-1 pl-6">
            <li>Hazardous materials</li>
            <li>Liquids without proper sealing</li>
            <li>Illegal or damaging contents</li>
          </ul>
          <p>You are responsible for any damage caused by misuse.</p>
        </>
      ),
    },
    {
      title: "Liability",
      content: (
        <p>QC Tote Rentals is not liable for injury or damage to personal property during use. You assume all risks associated with use of the equipment.</p>
      ),
    },
    {
      title: "Condition Acknowledgment",
      content: <p>All items are delivered clean and in usable condition.</p>,
    },
    {
      title: "Changes / Extensions",
      content: (
        <p>Contact us before your scheduled pickup date if you need an extension. Extensions are subject to availability and additional charges.</p>
      ),
    },
    {
      title: "Non-Return & Replacement Charges",
      content: (
        <>
          <p className="mb-3">If equipment is not returned within 30 days of delivery and no extension is arranged, it will be considered unreturned.</p>
          <p className="mb-3">You authorize QC Tote Rentals to charge your card for replacement costs:</p>
          <ul className="mb-3 list-disc space-y-1 pl-6">
            <li>Tote (bin + lid): $10 each</li>
            <li>Tote Dolly: $40</li>
          </ul>
          <p>Returned items after charges may be refunded at our discretion.</p>
        </>
      ),
    },
  ];

  return (
    <main className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center md:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
            QC Tote Rental
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Rental Agreement
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Please review these terms before completing your reservation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-8 rounded-2xl border border-lime-300 bg-lime-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 font-black text-slate-950">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">Agreement to Terms</h2>
              <p className="mt-1 leading-7 text-slate-700">
                By completing your purchase, you agree to the following terms.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-lime-400">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
                  <div className="mt-3 leading-7 text-slate-700">{section.content}</div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-950 p-8 text-center text-white">
          <h2 className="text-2xl font-black">Ready to Reserve?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Return to the reservation page when you are ready to select your tote package and requested dates.
          </p>
          <a
            href="/reserve"
            className="mt-6 inline-block rounded-lg bg-lime-400 px-8 py-3 font-bold text-slate-950 transition hover:bg-lime-300"
          >
            Reserve Your Totes
          </a>
        </div>
      </section>
    </main>
  );
}
