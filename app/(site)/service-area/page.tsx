import Link from "next/link";

export const metadata = {
  title: "Moving Box & Tote Rental Service Area",
  description: "Moving box and reusable tote rental across the Quad Cities and surrounding areas, including Davenport, Bettendorf, Moline, Rock Island, Geneseo, LeClaire, Muscatine, Clinton and more.",
};

const freeAreas = ["Davenport, IA","Bettendorf, IA","Rock Island, IL","Moline, IL","East Moline, IL","Silvis, IL","Milan, IL","Geneseo, IL","Coal Valley, IL","Colona, IL","Port Byron, IL","LeClaire, IA"];
const feeAreas = ["Muscatine, IA","Clinton, IA","Eldridge, IA","DeWitt, IA","Orion, IL"];

export default function ServiceAreaPage() {
  return (
    <main className="bg-slate-50">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <p className="font-bold uppercase tracking-widest text-lime-400">Local Moving Supplies Delivered</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Moving Box & Tote Rental in the Quad Cities & Surrounding Areas</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">Skip the cardboard box hunt. QC Tote Rental delivers reusable 27-gallon plastic moving boxes and totes throughout our Illinois and Iowa service area.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-lime-300 bg-white p-8 shadow-sm">
            <span className="inline-block rounded-full bg-lime-400 px-4 py-1 text-sm font-black text-slate-950">FREE DELIVERY & PICKUP</span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">Core & Nearby Service Area</h2>
            <p className="mt-3 text-slate-600">Moving tote delivery and pickup are included for these communities.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{freeAreas.map((area) => <div key={area} className="rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-800">{area}</div>)}</div>
          </div>
          <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-sm">
            <span className="inline-block rounded-full bg-amber-300 px-4 py-1 text-sm font-black text-slate-950">EXTENDED SERVICE AREA</span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">Delivery Available for a Small Fee</h2>
            <p className="mt-3 text-slate-600">A $15 fee applies per leg for delivery or pickup in these communities, or $30 when both stops are in the extended service area.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">{feeAreas.map((area) => <div key={area} className="rounded-lg bg-amber-50 px-4 py-3 font-semibold text-slate-800">{area}</div>)}</div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl bg-slate-50 p-7"><h2 className="text-2xl font-black">Moving Boxes in Davenport & Bettendorf</h2><p className="mt-3 leading-7 text-slate-600">For moves in Davenport and Bettendorf, reusable plastic moving totes provide an alternative to buying and assembling cardboard moving boxes. We deliver the totes, you pack and move, and we pick them up afterward.</p></article>
            <article className="rounded-2xl bg-slate-50 p-7"><h2 className="text-2xl font-black">Moving Boxes in Moline, Rock Island & East Moline</h2><p className="mt-3 leading-7 text-slate-600">Customers in Moline, Rock Island, East Moline, Silvis and Milan can rent stackable plastic moving boxes for moving, decluttering, renovations and other projects.</p></article>
            <article className="rounded-2xl bg-slate-50 p-7"><h2 className="text-2xl font-black">Geneseo, Colona & Nearby Illinois Communities</h2><p className="mt-3 leading-7 text-slate-600">Our service area extends beyond the core Quad Cities to Geneseo, Colona, Coal Valley, Port Byron and Orion, making moving tote rental available to more nearby Illinois customers.</p></article>
            <article className="rounded-2xl bg-slate-50 p-7"><h2 className="text-2xl font-black">LeClaire & Extended Iowa Service</h2><p className="mt-3 leading-7 text-slate-600">We also serve LeClaire and provide extended-area delivery options for Muscatine, Clinton, Eldridge and DeWitt.</p></article>
          </div>
        </div>
      </section>

      <section className="bg-lime-400 py-14 text-center text-slate-950"><div className="mx-auto max-w-3xl px-6"><h2 className="text-3xl font-black">Not Seeing Your Town?</h2><p className="mt-3 text-lg">Contact us before reserving. We may still be able to serve your location.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="rounded-lg border-2 border-slate-950 px-7 py-3 font-bold">Contact Us</Link><Link href="/reserve" className="rounded-lg bg-slate-950 px-7 py-3 font-bold text-white">Reserve Your Totes</Link></div></div></section>
    </main>
  );
}
