import type { Metadata } from "next";
import Link from "next/link";
import { serviceAreas } from "@/config/serviceAreas";

export const metadata: Metadata = {
  title: { absolute: "Moving Boxes Quad Cities | Plastic Moving Box Rental & Delivery" },
  description:
    "Looking for moving boxes in the Quad Cities? Rent reusable plastic moving boxes from QC Tote Rental with convenient delivery and pickup in Davenport, Bettendorf, Moline, Rock Island, Geneseo and surrounding areas.",
  alternates: { canonical: "https://qctoterentals.com/moving-boxes" },
};

export default function MovingBoxesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <p className="font-bold uppercase tracking-widest text-lime-400">Moving Boxes • Quad Cities & Surrounding Areas</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Moving Boxes in the Quad Cities</h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl font-semibold text-lime-400">Reusable Plastic Moving Boxes Delivered to Your Door</p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">Looking for moving boxes in the Quad Cities? Skip the hassle of finding, assembling, taping, and disposing of cardboard boxes. QC Tote Rental delivers sturdy, reusable 27-gallon plastic moving boxes directly to your home.</p>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-300">Pack your belongings, make your move, unpack, and we will pick the totes back up when you are finished.</p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/pricing" className="rounded-lg border border-lime-400 px-8 py-4 font-bold text-lime-400 transition hover:bg-lime-400 hover:text-slate-950">View Moving Box Packages</Link>
            <Link href="/reserve" className="rounded-lg bg-lime-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-lime-300">Reserve Your Moving Boxes</Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center"><p className="font-bold uppercase tracking-widest text-lime-600">Simple Moving</p><h2 className="mt-3 text-4xl font-black">A Simpler Way to Get Moving Boxes</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">Moving already comes with a long to-do list. Finding boxes does not need to be another chore. Your QC Tote Rental moving boxes arrive ready to pack, with no cardboard assembly and no tape needed to hold the boxes together.</p></div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {["Choose your package|Select the number of reusable moving boxes that fits your move.","We deliver|Your reusable plastic moving totes are delivered to your door ready to pack.","Pack and move|Fill the totes, stack them, and move them to your new home.","We pick them up|After you unpack, we return to collect the empty totes."].map((item,index)=>{const [title,text]=item.split("|");return <div key={title} className="rounded-2xl bg-white p-7 shadow-sm"><div className="text-4xl font-black text-lime-400">0{index+1}</div><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></div>})}
          </div>
          <div className="mt-10 text-center"><Link href="/reserve" className="inline-block rounded-lg bg-lime-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-lime-300">Reserve Moving Boxes</Link></div>
        </div>
      </section>

      <section className="bg-white py-20"><div className="mx-auto max-w-6xl px-6"><div className="text-center"><p className="font-bold uppercase tracking-widest text-lime-600">Rental Packages</p><h2 className="mt-3 text-4xl font-black">Moving Box Rental Packages</h2><p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Choose the package that works best for your move. Each package includes a two-week rental.</p></div><div className="mt-12 grid gap-6 md:grid-cols-3">{[{n:"20",p:"$99",d:"A convenient option for smaller moves, apartments, dorm moves, or when you just need additional moving boxes."},{n:"40",p:"$169",d:"More room for packing larger apartments, condos, and many household moves."},{n:"60",p:"$219",d:"Our largest package for moves that require plenty of reusable moving boxes."}].map(pkg=><div key={pkg.n} className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center"><h3 className="text-2xl font-black">{pkg.n} Moving Totes</h3><p className="mt-3 text-4xl font-black text-lime-600">{pkg.p}</p><p className="mt-1 font-semibold text-slate-600">for 2 weeks</p><p className="mt-5 leading-7 text-slate-600">{pkg.d}</p><Link href="/reserve" className="mt-7 inline-block rounded-lg bg-slate-950 px-6 py-3 font-bold text-white hover:bg-slate-800">Reserve {pkg.n} Totes</Link></div>)}</div><p className="mt-6 text-center text-slate-600">Need your totes longer? Rental extensions are available. <Link href="/pricing" className="font-bold underline decoration-lime-400 decoration-4 underline-offset-4">View complete pricing</Link>.</p></div></section>

      <section className="bg-slate-50 py-20"><div className="mx-auto max-w-6xl px-6"><div className="grid gap-12 lg:grid-cols-2 lg:items-start"><div><p className="font-bold uppercase tracking-widest text-lime-600">Why rent?</p><h2 className="mt-3 text-4xl font-black">Why Rent Plastic Moving Boxes?</h2><p className="mt-5 text-lg leading-8 text-slate-600">Cardboard has traditionally been used for moving, but it is not your only option. Reusable plastic moving boxes arrive ready to pack and return to us when your move is complete.</p></div><div className="grid gap-4 sm:grid-cols-2">{["No Box Assembly|Open the lid and start packing.","No Tape Required|Attached lids close without taping the tops and bottoms of cardboard boxes.","Easy to Stack|Uniform-size totes stack neatly while packing, transporting, and unpacking.","Delivered to You|Your rental totes come directly to you within our service area.","No Cardboard Cleanup|Unpack and leave the empty totes for us to pick up.","Reusable|Durable containers can be used again and again."].map(item=>{const [title,text]=item.split("|");return <div key={title} className="rounded-2xl bg-white p-6"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-slate-600">{text}</p></div>})}</div></div></div></section>

      <section className="bg-white py-20"><div className="mx-auto max-w-6xl px-6"><div className="text-center"><p className="font-bold uppercase tracking-widest text-lime-600">Local Delivery</p><h2 className="mt-3 text-4xl font-black">Moving Boxes Delivered in the Quad Cities</h2><p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">QC Tote Rental provides reusable moving box rentals in the Quad Cities and surrounding communities. Explore a city page for local information, or check our full service area for delivery availability.</p></div><div className="mt-10 flex flex-wrap justify-center gap-3">{serviceAreas.map(area=><Link key={area.slug} href={`/${area.slug}`} className="rounded-full bg-slate-100 px-5 py-3 font-semibold text-slate-800 transition hover:bg-lime-100">Moving Boxes in {area.city}</Link>)}</div><div className="mt-9 text-center"><Link href="/service-area" className="font-bold text-slate-950 underline decoration-lime-400 decoration-4 underline-offset-4">View Our Full Service Area</Link></div></div></section>

      <section className="bg-slate-950 py-20 text-white"><div className="mx-auto max-w-4xl px-6"><div className="text-center"><p className="font-bold uppercase tracking-widest text-lime-400">Questions</p><h2 className="mt-3 text-4xl font-black">Moving Box Rental FAQ</h2></div><div className="mt-12 space-y-8">{[
        ["Can I rent moving boxes instead of buying cardboard boxes?","Yes. QC Tote Rental provides reusable plastic moving totes that serve the same basic purpose as moving boxes. We deliver them before your move and pick them up after you finish unpacking."],
        ["How long do I keep the moving boxes?","Our standard rental period is two weeks. If you need more time, rental extensions are available."],
        ["Do I need packing tape?","You do not need tape to close our moving totes. The totes have attached lids. You may still want packing materials to protect fragile belongings."],
        ["Do you deliver the moving boxes?","Yes. QC Tote Rental delivers totes within our service area and picks them up at the end of the rental."],
        ["How many moving boxes should I rent?","It depends on the size of your home, how much you own, and how you pack. We offer packages of 20, 40, and 60 totes."],
        ["What size are the moving totes?","Each tote has a 27-gallon capacity and measures approximately 28 inches long, 20 inches wide, and 15 inches high."],
        ["Where can I rent moving boxes near the Quad Cities?","QC Tote Rental provides moving box rental and delivery throughout the Quad Cities and surrounding communities. Check our service area to see whether delivery is available to your location."]
      ].map(([q,a])=><div key={q} className="border-b border-slate-800 pb-8"><h3 className="text-xl font-bold text-lime-400">{q}</h3><p className="mt-3 leading-7 text-slate-300">{a}</p></div>)}</div></div></section>

      <section className="bg-lime-400 py-20"><div className="mx-auto max-w-4xl px-6 text-center text-slate-950"><h2 className="text-4xl font-black sm:text-5xl">Skip the Cardboard Box Hunt</h2><p className="mx-auto mt-5 max-w-2xl text-lg font-medium">Choose your QC Tote Rental package, tell us when you need your totes, and we will take care of delivery and pickup.</p><Link href="/reserve" className="mt-9 inline-block rounded-lg bg-slate-950 px-8 py-4 font-bold text-white transition hover:bg-slate-800">Reserve Your Moving Boxes</Link></div></section>
    </main>
  );
}
